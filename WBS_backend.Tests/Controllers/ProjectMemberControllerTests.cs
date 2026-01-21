using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.Controllers;
using WBS_backend.Services;
using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.DTOs.ResponseDTOs;
using WBS_backend.Entities;
using FluentAssertions;
using WBS_backend.Services.Interfaces;

namespace WBS_backend.Tests.Controllers
{
    public class ProjectMemberControllerTests
    {
        private readonly Mock<IProjectMemberService> _mockProjectMemberService;
        private readonly ProjectMemberController _controller;

        public ProjectMemberControllerTests()
        {
            _mockProjectMemberService = new Mock<IProjectMemberService>();
            _controller = new ProjectMemberController(_mockProjectMemberService.Object);
        }

        [Fact]
        public async Task GetAllMemberByProjectId_Should_ReturnOk_WhenResultNotNull()
        {
            var list = new List<ProjectMemberResponse>
            {
                new ProjectMemberResponse { MediateProjectMemberId = 1, MemberId = 1, MemberFullName = "A" }
            };

            _mockProjectMemberService.Setup(s => s.GetAllMemberByProjectIdAsync(1))
                .ReturnsAsync(list);

            var result = await _controller.GetAllMemberByProjectId(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsAssignableFrom<List<ProjectMemberResponse>>(okResult.Value);
            returned.Should().BeEquivalentTo(list);
        }

        [Fact]
        public async Task GetAllMemberByProjectId_Should_ReturnNotFound_WhenResultNull()
        {
            _mockProjectMemberService.Setup(s => s.GetAllMemberByProjectIdAsync(1))
                .ReturnsAsync((List<ProjectMemberResponse>?)null);

            var result = await _controller.GetAllMemberByProjectId(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetAllMemberByProjectId_Should_Return500_WhenExceptionThrown()
        {
            _mockProjectMemberService.Setup(s => s.GetAllMemberByProjectIdAsync(1))
                .ThrowsAsync(new Exception("test"));

            var result = await _controller.GetAllMemberByProjectId(1);

            var objectResult = Assert.IsType<ObjectResult>(result);
            objectResult.StatusCode.Should().Be(500);
        }

        [Fact]
        public async Task GetAllRole_Should_ReturnOk_WhenResultNotNull()
        {
            var roles = new List<RoleProjectMemberResponse>
            {
                new RoleProjectMemberResponse { RoleId = 1, RoleName = "Leader" }
            };

            _mockProjectMemberService.Setup(s => s.GetAllRoleAsync())
                .ReturnsAsync(roles);

            var result = await _controller.GetAllRole();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsAssignableFrom<List<RoleProjectMemberResponse>>(okResult.Value);
            returned.Should().BeEquivalentTo(roles);
        }

        [Fact]
        public async Task GetAllRole_Should_ReturnNotFound_WhenResultNull()
        {
            _mockProjectMemberService.Setup(s => s.GetAllRoleAsync())
                .ReturnsAsync((List<RoleProjectMemberResponse>?)null);

            var result = await _controller.GetAllRole();

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetAllRole_Should_Return500_WhenExceptionThrown()
        {
            _mockProjectMemberService.Setup(s => s.GetAllRoleAsync())
                .ThrowsAsync(new Exception("test"));

            var result = await _controller.GetAllRole();

            var objectResult = Assert.IsType<ObjectResult>(result);
            objectResult.StatusCode.Should().Be(500);
        }

        [Fact]
        public async Task PostProjectMemberByProjectId_Should_ReturnOk_WhenSuccess()
        {
            var request = new ProjectMemberRequest { MemberId = 1, RoleId = 1 };
            var response = new ProjectMemberResponse { MediateProjectMemberId = 1, MemberId = 1, RoleId = 1 };

            _mockProjectMemberService.Setup(s => s.AddMemberForProjectId(1, request))
                .ReturnsAsync(response);

            var result = await _controller.PostProjectMemberByProjectId(1, request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<ProjectMemberResponse>(okResult.Value);
            returned.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task PostProjectMemberByProjectId_Should_Return404_WhenKeyNotFound()
        {
            var request = new ProjectMemberRequest { MemberId = 1, RoleId = 1 };

            _mockProjectMemberService.Setup(s => s.AddMemberForProjectId(1, request))
                .ThrowsAsync(new KeyNotFoundException("not found"));

            var result = await _controller.PostProjectMemberByProjectId(1, request);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task PostProjectMemberByProjectId_Should_Return500_WhenExceptionThrown()
        {
            var request = new ProjectMemberRequest { MemberId = 1, RoleId = 1 };

            _mockProjectMemberService.Setup(s => s.AddMemberForProjectId(1, request))
                .ThrowsAsync(new Exception("error"));

            var result = await _controller.PostProjectMemberByProjectId(1, request);

            var objectResult = Assert.IsType<ObjectResult>(result);
            objectResult.StatusCode.Should().Be(500);
        }
    }
}