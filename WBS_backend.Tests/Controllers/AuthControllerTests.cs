using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.Controllers;
using WBS_backend.Services;
using WBS_backend.DTOs.Request;
using WBS_backend.DTOs.Response;
using WBS_backend.DTOs;
using FluentAssertions;

namespace WBS_backend.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _controller = new AuthController(_mockAuthService.Object);
        }

        #region Register Tests

        [Fact]
        public async Task Register_ReturnsOkResult_WhenRegistrationSuccessful()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "test@example.com",
                Password = "Password123!",
                MemberFullName = "Test User",
                LoginName = "testuser"
            };
            var expectedResponse = new UserResponse
            {
                Email = "test@example.com",
                MemberFullName = "Test User",
                LoginName = "testuser"
            };
            _mockAuthService.Setup(s => s.RegisterAsync(registerRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenInvalidOperationExceptionThrown()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "existing@example.com",
                Password = "Password123!",
                MemberFullName = "Test User",
                LoginName = "testuser"
            };
            _mockAuthService.Setup(s => s.RegisterAsync(registerRequest))
                .ThrowsAsync(new InvalidOperationException("Email đã tồn tại"));

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().Be("Email đã tồn tại");
        }

        [Fact]
        public async Task Register_ReturnsInternalServerError_WhenExceptionThrown()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "test@example.com",
                Password = "Password123!",
                MemberFullName = "Test User",
                LoginName = "testuser"
            };
            _mockAuthService.Setup(s => s.RegisterAsync(registerRequest))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.Should().Be("Lỗi hệ thống");
        }

        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_ReturnsOkResult_WithToken_WhenCredentialsAreValid()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                LoginName = "testuser",
                Password = "Password123!"
            };
            var expectedResponse = new AuthResponseDto
            {
                Token = "valid-jwt-token",
                Message = "Đăng nhập thành công"
            };
            _mockAuthService.Setup(s => s.LoginAsync(loginRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedResponse = Assert.IsType<AuthResponseDto>(okResult.Value);
            returnedResponse.Token.Should().NotBeNullOrEmpty();
            returnedResponse.Token.Should().Be("valid-jwt-token");
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                LoginName = "testuser",
                Password = "WrongPassword"
            };
            var expectedResponse = new AuthResponseDto
            {
                Token = string.Empty,
                Message = "Sai email hoặc mật khẩu"
            };
            _mockAuthService.Setup(s => s.LoginAsync(loginRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            unauthorizedResult.Value.Should().Be("Sai email hoặc mật khẩu");
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenTokenIsNull()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                LoginName = "testuser",
                Password = "Password123!"
            };
            var expectedResponse = new AuthResponseDto
            {
                Token = string.Empty,
                Message = "Tài khoản chưa được xác thực"
            };
            _mockAuthService.Setup(s => s.LoginAsync(loginRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            unauthorizedResult.Value.Should().Be("Tài khoản chưa được xác thực");
        }

        #endregion

        #region VerifyEmail Tests

        [Fact]
        public async Task VerifyEmail_ReturnsOkResult_WhenVerificationSuccessful()
        {
            // Arrange
            string email = "test@example.com";
            string code = "123456";
            var expectedResponse = new UserResponse
            {
                Email = email,
                MemberFullName = "Test User"
            };
            _mockAuthService.Setup(s => s.VerifyEmailAsync(email, code))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.VerifyEmail(email, code);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task VerifyEmail_ReturnsBadRequest_WhenInvalidOperationExceptionThrown()
        {
            // Arrange
            string email = "test@example.com";
            string code = "invalid-code";
            _mockAuthService.Setup(s => s.VerifyEmailAsync(email, code))
                .ThrowsAsync(new InvalidOperationException("Mã xác thực không hợp lệ"));

            // Act
            var result = await _controller.VerifyEmail(email, code);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().Be("Mã xác thực không hợp lệ");
        }

        [Fact]
        public async Task VerifyEmail_ReturnsInternalServerError_WhenExceptionThrown()
        {
            // Arrange
            string email = "test@example.com";
            string code = "123456";
            _mockAuthService.Setup(s => s.VerifyEmailAsync(email, code))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.VerifyEmail(email, code);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.Should().Be("Lỗi hệ thống");
        }

        [Fact]
        public async Task VerifyEmail_HandlesEmptyEmail()
        {
            // Arrange
            string email = "";
            string code = "123456";
            _mockAuthService.Setup(s => s.VerifyEmailAsync(email, code))
                .ThrowsAsync(new InvalidOperationException("Email không được để trống"));

            // Act
            var result = await _controller.VerifyEmail(email, code);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().Be("Email không được để trống");
        }

        [Fact]
        public async Task VerifyEmail_HandlesEmptyCode()
        {
            // Arrange
            string email = "test@example.com";
            string code = "";
            _mockAuthService.Setup(s => s.VerifyEmailAsync(email, code))
                .ThrowsAsync(new InvalidOperationException("Mã xác thực không được để trống"));

            // Act
            var result = await _controller.VerifyEmail(email, code);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().Be("Mã xác thực không được để trống");
        }

        #endregion
    }
}
