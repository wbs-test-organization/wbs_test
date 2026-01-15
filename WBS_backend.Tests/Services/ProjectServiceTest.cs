using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;
using WBS_backend.Services;

namespace WBS_backend.Tests.Services
{
    public class ProjectServiceTest
    {
        private AppDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task UpdateProject_Should_Throw_When_IdNotFound()
        {
            using var context = CreateDbContext();
            var service = new ProjectService(context);
            var request = new UpdateProjectRequest { ProjectName = "ABC" };

            var action = async () => await service.UpdateProject(999, request);

            await action.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task UpdateProject_Should_Update_Only_NonNull_Fields()
        {
            using var context = CreateDbContext();

            var existing = new Project
            {
                ProjectCode = "P1",
                ProjectName = "Old name",
                ExpectedStartDate = new DateTime(2024, 1, 1),
                ExpectedEndDate = new DateTime(2024, 2, 1),
                WorkProgress = 10m,
                EstimateTime = 5,
                SpentTime = 1,
                ProjectStatusId = 1
            };

            context.Projects.Add(existing);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var request = new UpdateProjectRequest
            {
                ProjectCode = "P2",
                ProjectName = null, // giữ nguyên tên
                ActualStartDate = new DateTime(2024, 1, 10),
                WorkProgress = 50m,
                EstimateTime = null, // giữ nguyên
                SpentTime = 2,
                ProjectStatusId = 2
            };

            var result = await service.UpdateProject(existing.ProjectId, request);

            result.ProjectCode.Should().Be("P2");
            result.ProjectName.Should().Be("Old name");
            result.ExpectedStartDate.Should().Be(new DateTime(2024, 1, 1));
            result.ExpectedEndDate.Should().Be(new DateTime(2024, 2, 1));
            result.ActualStartDate.Should().Be(new DateTime(2024, 1, 10));
            result.WorkProgress.Should().Be(50m);
            result.EstimateTime.Should().Be(5);
            result.SpentTime.Should().Be(2);
            result.ProjectStatusId.Should().Be(2);
        }

        [Fact]
        public async Task UpdateProject_Should_Throw_When_Project_Is_Deleted()
        {
            using var context = CreateDbContext();

            var project = new Project
            {
                ProjectCode = "P1",
                ProjectName = "Name",
                ProjectDeleteStatus = true
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);
            var request = new UpdateProjectRequest { ProjectName = "New" };

            var action = async () => await service.UpdateProject(project.ProjectId, request);

            await action.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task CreateProject_Should_Create_New_Project()
        {
            using var context = CreateDbContext();
            var service = new ProjectService(context);

            var request = new CreateProjectRequest
            {
                ProjectCode = "P1",
                ProjectName = "Project 1",
                ProjectStatusId = 1,
                ExpectedStartDate = new DateTime(2024, 1, 1),
                ExpectedEndDate = new DateTime(2024, 2, 1),
                ProjectLeadId = 10
            };

            var project = await service.CreateProject(request);

            project.ProjectId.Should().BeGreaterThan(0);
            project.ProjectCode.Should().Be("P1");
            project.ProjectName.Should().Be("Project 1");
            project.ProjectStatusId.Should().Be(1);

            var count = await context.Projects.CountAsync();
            count.Should().Be(1);
        }

        [Fact]
        public async Task GetAllProjectAsync_Should_Return_Projects_Ordered_By_Id_Desc()
        {
            using var context = CreateDbContext();

            var p1 = new Project { ProjectCode = "P1", ProjectName = "A" };
            var p2 = new Project { ProjectCode = "P2", ProjectName = "B" };

            context.Projects.AddRange(p1, p2);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var result = await service.GetAllProjectAsync();

            result.Should().HaveCount(2);
            result[0].ProjectId.Should().BeGreaterThan(result[1].ProjectId);
        }

        [Fact]
        public async Task GetProjectByIdAsync_Should_Return_Dto_When_Project_Exists_And_NotDeleted()
        {
            using var context = CreateDbContext();

            var project = new Project
            {
                ProjectCode = "P1",
                ProjectName = "A"
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var dto = await service.GetProjectByIdAsync(project.ProjectId);

            dto.Should().NotBeNull();
            dto!.ProjectId.Should().Be(project.ProjectId);
            dto.ProjectName.Should().Be("A");
            dto.ProjectStatusName.Should().Be("Chưa xác định");
        }

        [Fact]
        public async Task GetProjectByIdAsync_Should_Return_Null_When_Project_Deleted()
        {
            using var context = CreateDbContext();

            var project = new Project
            {
                ProjectCode = "P1",
                ProjectName = "A",
                ProjectDeleteStatus = true
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var dto = await service.GetProjectByIdAsync(project.ProjectId);

            dto.Should().BeNull();
        }

        [Fact]
        public async Task DeleteProjectByIdAsync_Should_SoftDelete_And_Return_True()
        {
            using var context = CreateDbContext();

            var project = new Project
            {
                ProjectCode = "P1",
                ProjectName = "A"
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var result = await service.DeleteProjectByIdAsync(project.ProjectId);

            result.Should().BeTrue();

            var updated = await context.Projects.FindAsync(project.ProjectId);
            updated!.ProjectDeleteStatus.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteProjectByIdAsync_Should_Return_False_When_NotFound_Or_AlreadyDeleted()
        {
            using var context = CreateDbContext();

            var project = new Project
            {
                ProjectCode = "P1",
                ProjectName = "A",
                ProjectDeleteStatus = true
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            var service = new ProjectService(context);

            var resultForDeleted = await service.DeleteProjectByIdAsync(project.ProjectId);
            resultForDeleted.Should().BeFalse();

            var resultForMissing = await service.DeleteProjectByIdAsync(999);
            resultForMissing.Should().BeFalse();
        }
    }
}