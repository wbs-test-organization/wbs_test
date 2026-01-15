using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WBS_backend.Data;
using WBS_backend.DTOs.Request;
using WBS_backend.DTOs.Response;
using WBS_backend.Entities;
using WBS_backend.Services;
using Xunit;

namespace WBS_backend.Tests.Services
{
    public class AuthServiceTests
    {
        private AppDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        private IConfiguration CreateConfiguration()
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super_secret_key_super_secret_key",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Smtp:Username"] = "noreply@example.com",
                ["Smtp:Host"] = "localhost",
                ["Smtp:Port"] = "25",
                ["Smtp:Password"] = "password"
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(settings!)
                .Build();
        }

        [Fact]
        public async Task RegisterAsync_Should_Create_User_When_Email_And_Login_Not_Exist()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var request = new RegisterRequest
            {
                Email = "user@example.com",
                LoginName = "user1",
                Password = "Password123!",
                MemberFullName = "User One"
            };

            var response = await service.RegisterAsync(request);

            response.Should().NotBeNull();
            response.Email.Should().Be("user@example.com");
            response.LoginName.Should().Be("user1");
            response.IsActive.Should().BeFalse();

            var member = await context.Members.SingleAsync();
            member.Email.Should().Be("user@example.com");
            member.LoginName.Should().Be("user1");
            member.IsActive.Should().BeFalse();
            member.RoleId.Should().Be(2);
            member.ActivatedCode.Should().NotBeNullOrWhiteSpace();
            BCrypt.Net.BCrypt.Verify("Password123!", member.Password).Should().BeTrue();
        }

        [Fact]
        public async Task RegisterAsync_Should_Throw_When_Email_Or_Login_Already_Exists()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            context.Members.Add(new Member
            {
                MemberFullName = "Existing",
                Email = "existing@example.com",
                LoginName = "existing",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsActive = true
            });
            await context.SaveChangesAsync();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var request = new RegisterRequest
            {
                Email = "existing@example.com",
                LoginName = "another",
                Password = "Password123!",
                MemberFullName = "User Two"
            };

            var action = async () => await service.RegisterAsync(request);

            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Tài khoản hoặc email đã tồn tại");
        }

        [Fact]
        public async Task LoginAsync_Should_Return_Success_When_Credentials_Valid()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            var member = new Member
            {
                MemberFullName = "User One",
                Email = "user@example.com",
                LoginName = "user1",
                Password = passwordHash,
                IsActive = true,
                RoleId = 1
            };
            context.Members.Add(member);
            await context.SaveChangesAsync();

            jwtServiceMock.Setup(j => j.GenerateToken(Moq.It.IsAny<Member>()))
                .Returns("jwt-token");

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var request = new LoginRequest
            {
                LoginName = "user1",
                Password = "Password123!"
            };

            var result = await service.LoginAsync(request);

            result.Success.Should().BeTrue();
            result.Token.Should().Be("jwt-token");
            result.Member.Should().NotBeNull();
            result.Member!.LoginName.Should().Be("user1");
        }

        [Fact]
        public async Task LoginAsync_Should_Return_Failed_When_User_NotFound_Or_WrongPassword()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var member = new Member
            {
                MemberFullName = "User One",
                Email = "user@example.com",
                LoginName = "user1",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsActive = true
            };
            context.Members.Add(member);
            await context.SaveChangesAsync();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var request = new LoginRequest
            {
                LoginName = "user1",
                Password = "WrongPassword"
            };

            var result = await service.LoginAsync(request);

            result.Success.Should().BeFalse();
            result.Token.Should().BeNullOrEmpty();
            result.Message.Should().Be("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        [Fact]
        public async Task VerifyEmailAsync_Should_Activate_User_When_Code_Matches()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var member = new Member
            {
                MemberFullName = "User One",
                Email = "user@example.com",
                LoginName = "user1",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsActive = false,
                ActivatedCode = "ABC123"
            };
            context.Members.Add(member);
            await context.SaveChangesAsync();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var response = await service.VerifyEmailAsync("user@example.com", "ABC123");

            response.IsActive.Should().BeTrue();

            var updated = await context.Members.SingleAsync();
            updated.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task VerifyEmailAsync_Should_Throw_When_Code_Invalid()
        {
            using var context = CreateDbContext();
            var config = CreateConfiguration();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var member = new Member
            {
                MemberFullName = "User One",
                Email = "user@example.com",
                LoginName = "user1",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsActive = false,
                ActivatedCode = "ABC123"
            };
            context.Members.Add(member);
            await context.SaveChangesAsync();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var action = async () => await service.VerifyEmailAsync("user@example.com", "WRONG");

            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        [Fact]
        public void VerificationEmailContent_Should_Contain_Email_And_Code()
        {
            var config = CreateConfiguration();
            using var context = CreateDbContext();
            var jwtServiceMock = new Moq.Mock<IJwtService>();

            var service = new AuthService(context, jwtServiceMock.Object, config);

            var member = new Member
            {
                MemberFullName = "User One",
                Email = "user@example.com",
                ActivatedCode = "ABC123"
            };

            var content = AuthService.VerificationEmailContent(member);

            var encodedEmail = Uri.EscapeDataString(member.Email);
            content.Should().Contain(encodedEmail);
            content.Should().Contain("ABC123");
            content.Should().Contain("verify-email");
        }
    }
}
