using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.Controllers;
using WBS_backend.Services;
using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;
using FluentAssertions;
using WBS_backend.DTOs.Response;

namespace WBS_backend.Tests.Controllers
{
    public class MemberControllerTests
    {
        private readonly Mock<IMemberService> _mockMemberService;
        private readonly MemberController _controller;

        public MemberControllerTests()
        {
            _mockMemberService = new Mock<IMemberService>();
            _controller = new MemberController(_mockMemberService.Object);
        }

        [Fact]
        public async Task GetMember_returnOk_WithListOfMember()
        {
            var ArrayMember = new List<MemberListResponse>
            {
              new MemberListResponse {MemberId = 1, MemberFullName = "a"},
              new MemberListResponse {MemberId = 2, MemberFullName = "b"}  
            };
            _mockMemberService.Setup(s => s.GetAllMemberAsync()).ReturnsAsync(ArrayMember);

            var result = await _controller.GetAllMember();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedMembers = Assert.IsAssignableFrom<List<MemberListResponse>>(okResult.Value);
            returnedMembers.Should().HaveCount(2);
            returnedMembers.Should().BeEquivalentTo(ArrayMember);
        }

        [Fact]
        public async Task GetMember_ReturnNotFound_WhenNoMember()
        {
            _mockMemberService.Setup(s => s.GetAllMemberAsync()).ReturnsAsync(new List<MemberListResponse>());

            var result = await _controller.GetAllMember();
            
            var okResult = Assert.IsType<OkObjectResult>(result);
            okResult.StatusCode.Should().Be(200);

            var returnedMembers = Assert.IsAssignableFrom<List<MemberListResponse>>(okResult.Value);
            returnedMembers.Should().BeEmpty();
        }

        [Fact]
        public async Task GetMember_ReturnNotFound_WhenServiceReturnsNull()
        {
            _mockMemberService.Setup(s => s.GetAllMemberAsync()).ReturnsAsync((List<MemberListResponse>?)null);

            var result = await _controller.GetAllMember();

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetMember_Return500_WhenExceptionIsThrown()
        {
            _mockMemberService.Setup(s => s.GetAllMemberAsync()).ThrowsAsync(new Exception("error"));

            var result = await _controller.GetAllMember();

            var objectResult = Assert.IsType<ObjectResult>(result);
            objectResult.StatusCode.Should().Be(500);
        }
    }
}