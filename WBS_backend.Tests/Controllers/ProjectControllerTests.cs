using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.Controllers;
using WBS_backend.Services;
using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;
using FluentAssertions;

namespace WBS_backend.Tests.Controllers
{
    public class ProjectControllerTests
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly ProjectController _controller;

        public ProjectControllerTests()
        {
            _mockProjectService = new Mock<IProjectService>();
            _controller = new ProjectController(_mockProjectService.Object);
        }

        #region GetProjects Tests

        [Fact]
        public async Task GetProjects_ReturnsOkResult_WithListOfProjects()
        {
            // Arrange
            var expectedProjects = new List<ProjectResponseDto>
            {
                new ProjectResponseDto { ProjectId = 1, ProjectName = "Project 1" },
                new ProjectResponseDto { ProjectId = 2, ProjectName = "Project 2" }
            };
            _mockProjectService.Setup(s => s.GetAllProjectAsync())
                .ReturnsAsync(expectedProjects);

            // Act
            var result = await _controller.GetProjects();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedProjects = Assert.IsAssignableFrom<List<ProjectResponseDto>>(okResult.Value);
            returnedProjects.Should().HaveCount(2);
            returnedProjects.Should().BeEquivalentTo(expectedProjects);
        }

        [Fact]
        public async Task GetProjects_ReturnsEmptyList_WhenNoProjectsExist()
        {
            // Arrange
            _mockProjectService.Setup(s => s.GetAllProjectAsync())
                .ReturnsAsync(new List<ProjectResponseDto>());

            // Act
            var result = await _controller.GetProjects();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedProjects = Assert.IsAssignableFrom<List<ProjectResponseDto>>(okResult.Value);
            returnedProjects.Should().BeEmpty();
        }

        #endregion

        #region GetProjectById Tests

        [Fact]
        public async Task GetProjectById_ReturnsOkResult_WhenProjectExists()
        {
            // Arrange
            int projectId = 1;
            var expectedProject = new ProjectResponseDto 
            { 
                ProjectId = projectId, 
                ProjectName = "Test Project" 
            };
            _mockProjectService.Setup(s => s.GetProjectByIdAsync(projectId))
                .ReturnsAsync(expectedProject);

            // Act
            var result = await _controller.GetProjectById(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedProject = Assert.IsType<ProjectResponseDto>(okResult.Value);
            returnedProject.Should().BeEquivalentTo(expectedProject);
        }

        [Fact]
        public async Task GetProjectById_ReturnsNotFound_WhenProjectDoesNotExist()
        {
            // Arrange
            int projectId = 999;
            _mockProjectService.Setup(s => s.GetProjectByIdAsync(projectId))
                .ReturnsAsync((ProjectResponseDto?)null);

            // Act
            var result = await _controller.GetProjectById(projectId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            notFoundResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetProjectById_ReturnsInternalServerError_WhenExceptionThrown()
        {
            // Arrange
            int projectId = 1;
            _mockProjectService.Setup(s => s.GetProjectByIdAsync(projectId))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetProjectById(projectId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            statusCodeResult.StatusCode.Should().Be(500);
        }

        #endregion

        #region PostProject Tests

        [Fact]
        public async Task PostProject_ReturnsOkResult_WithCreatedProject()
        {
            // Arrange
            var createRequest = new CreateProjectRequest 
            { 
                ProjectName = "New Project",
                ProjectCode = "PRJ001",
                ProjectStatusId = 1,
                ProjectLeadId = 1
            };
            var expectedProject = new Project 
            { 
                ProjectId = 1, 
                ProjectName = "New Project",
                ProjectCode = "PRJ001"
            };
            _mockProjectService.Setup(s => s.CreateProject(createRequest))
                .ReturnsAsync(expectedProject);

            // Act
            var result = await _controller.PostProject(createRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedProject = Assert.IsType<Project>(okResult.Value);
            returnedProject.Should().BeEquivalentTo(expectedProject);
        }

        [Fact]
        public async Task PostProject_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var createRequest = new CreateProjectRequest();
            _controller.ModelState.AddModelError("ProjectName", "Required");

            // Act
            var result = await _controller.PostProject(createRequest);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task PostProject_ReturnsBadRequest_WhenArgumentExceptionThrown()
        {
            // Arrange
            var createRequest = new CreateProjectRequest 
            { 
                ProjectName = "Test",
                ProjectCode = "PRJ001",
                ProjectStatusId = 1,
                ProjectLeadId = 1
            };
            _mockProjectService.Setup(s => s.CreateProject(createRequest))
                .ThrowsAsync(new ArgumentException("Invalid project data"));

            // Act
            var result = await _controller.PostProject(createRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task PostProject_ReturnsInternalServerError_WhenExceptionThrown()
        {
            // Arrange
            var createRequest = new CreateProjectRequest 
            { 
                ProjectName = "Test",
                ProjectCode = "PRJ001",
                ProjectStatusId = 1,
                ProjectLeadId = 1
            };
            _mockProjectService.Setup(s => s.CreateProject(createRequest))
                .ThrowsAsync(new Exception("Server error"));

            // Act
            var result = await _controller.PostProject(createRequest);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            statusCodeResult.StatusCode.Should().Be(500);
        }

        #endregion

        #region PatchProjectById Tests

        [Fact]
        public async Task PatchProjectById_ReturnsOkResult_WhenUpdateSuccessful()
        {
            // Arrange
            int projectId = 1;
            var updateRequest = new UpdateProjectRequest 
            { 
                ProjectName = "Updated Project"
            };
            var updatedProject = new Project 
            { 
                ProjectId = projectId, 
                ProjectName = "Updated Project",
                ProjectCode = "PRJ001"
            };
            _mockProjectService.Setup(s => s.UpdateProject(projectId, updateRequest))
                .ReturnsAsync(updatedProject);

            // Act
            var result = await _controller.PatchProjectById(projectId, updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task PatchProjectById_ReturnsNotFound_WhenProjectDoesNotExist()
        {
            // Arrange
            int projectId = 999;
            var updateRequest = new UpdateProjectRequest 
            { 
                ProjectName = "Updated Project"
            };
            _mockProjectService.Setup(s => s.UpdateProject(projectId, updateRequest))
                .ThrowsAsync(new KeyNotFoundException("Project not found"));

            // Act
            var result = await _controller.PatchProjectById(projectId, updateRequest);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            notFoundResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task PatchProjectById_ReturnsInternalServerError_WhenExceptionThrown()
        {
            // Arrange
            int projectId = 1;
            var updateRequest = new UpdateProjectRequest 
            { 
                ProjectName = "Updated Project"
            };
            _mockProjectService.Setup(s => s.UpdateProject(projectId, updateRequest))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.PatchProjectById(projectId, updateRequest);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            statusCodeResult.StatusCode.Should().Be(500);
        }

        #endregion

        #region DeleteProjectById Tests

        [Fact]
        public async Task DeleteProjectById_ReturnsOkResult_WhenDeleteSuccessful()
        {
            // Arrange
            int projectId = 1;
            _mockProjectService.Setup(s => s.DeleteProjectByIdAsync(projectId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteProjectById(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.True((bool)okResult.Value!);
        }

        [Fact]
        public async Task DeleteProjectById_ReturnsBadRequest_WhenProjectNotFoundOrAlreadyDeleted()
        {
            // Arrange
            int projectId = 999;
            _mockProjectService.Setup(s => s.DeleteProjectByIdAsync(projectId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteProjectById(projectId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            badRequestResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteProjectById_ReturnsNotFound_WhenKeyNotFoundExceptionThrown()
        {
            // Arrange
            int projectId = 999;
            _mockProjectService.Setup(s => s.DeleteProjectByIdAsync(projectId))
                .ThrowsAsync(new KeyNotFoundException("Project not found"));

            // Act
            var result = await _controller.DeleteProjectById(projectId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            notFoundResult.Value.Should().NotBeNull();
        }

        #endregion
    }
}
