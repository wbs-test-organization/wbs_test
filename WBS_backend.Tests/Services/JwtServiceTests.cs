using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using WBS_backend.Entities;
using WBS_backend.Services;
using Xunit;

namespace WBS_backend.Tests.Services
{
    public class JwtServiceTests
    {
        private IConfiguration CreateConfiguration()
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super_secret_key_super_secret_key",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience"
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(settings!)
                .Build();
        }

        [Fact]
        public void GenerateToken_Should_Create_Valid_Token_With_Claims()
        {
            var config = CreateConfiguration();
            var service = new JwtService(config);

            var member = new Member
            {
                MemberId = 1,
                Email = "user@example.com",
                LoginName = "user1",
                MemberFullName = "User One",
                RoleId = 1
            };

            var token = service.GenerateToken(member);

            token.Should().NotBeNullOrWhiteSpace();

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value
                .Should().Be("user@example.com");
            jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value
                .Should().Be("1");
            jwt.Claims.First(c => c.Type == "fullName").Value
                .Should().Be("User One");
        }

        [Fact]
        public void ValidateToken_Should_Return_MemberId_For_Valid_Token()
        {
            // Set JWT_SECRET env to match Jwt:Key in config for signing
            Environment.SetEnvironmentVariable("JWT_SECRET", "super_secret_key_super_secret_key");

            var config = CreateConfiguration();
            var service = new JwtService(config);

            var member = new Member
            {
                MemberId = 42,
                Email = "user@example.com",
                LoginName = "user1",
                MemberFullName = "User One",
                RoleId = 1
            };

            var token = service.GenerateToken(member);

            var result = service.ValidateToken(token);

            result.Should().Be(42);

            // Cleanup
            Environment.SetEnvironmentVariable("JWT_SECRET", null);
        }

        [Fact]
        public void ValidateToken_Should_Return_Null_For_Invalid_Or_Empty_Token()
        {
            var config = CreateConfiguration();
            var service = new JwtService(config);

            service.ValidateToken(null!).Should().BeNull();
            service.ValidateToken(string.Empty).Should().BeNull();
            service.ValidateToken("invalid-token").Should().BeNull();
        }
    }
}
