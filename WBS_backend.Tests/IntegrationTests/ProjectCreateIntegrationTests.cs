using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WBS_backend.Data;
using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;

namespace WBS_backend.Tests.Integration
{
    // Cần Microsoft.AspNetCore.Mvc.Testing + ProjectReference tới WBS_backend
    public class ProjectCreateIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public ProjectCreateIntegrationTests(WebApplicationFactory<Program> factory)
        {
            // Tùy biến host cho test: dùng InMemory DB + seed dữ liệu
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Bỏ cấu hình DbContext dùng MySQL
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Thay bằng InMemory database cho test
                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase("ProjectIntegrationTestDb"));

                    // Build provider để seed dữ liệu
                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    db.Database.EnsureCreated();

                    // Seed dữ liệu phụ thuộc nếu cần (status, member lead,…)
                    if (!db.ProjectStatus.Any())
                    {
                        db.ProjectStatus.Add(new ProjectStatus
                        {
                            ProjectStatusId = 1,
                            StatusName = "New"
                        });
                    }

                    if (!db.Members.Any())
                    {
                        db.Members.Add(new Member
                        {
                            MemberId = 1,
                            LoginName = "leader",
                            MemberFullName = "Leader Test",
                            Email = "leader@test.com",
                            IsActive = true
                        });
                    }

                    db.SaveChanges();

                    // Cấu hình authentication giả cho test, bypass [Authorize]
                    services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = "Test";
                        options.DefaultChallengeScheme = "Test";
                    })
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
                });
            });
        }

        [Fact]
        public async Task CreateProject_Should_ReturnOk_And_PersistToDatabase()
        {
            // Tạo HttpClient từ factory
            var client = _factory.CreateClient();

            // TODO: Nếu ProjectController có [Authorize], 
            // bạn cần cấu hình auth test hoặc tạm cho phép anonymous.

            var request = new CreateProjectRequest
            {
                ProjectCode = "PRJ-IT-001",
                ProjectName = "Integration Test Project",
                ProjectStatusId = 1,
                ExpectedStartDate = new DateTime(2024, 1, 1),
                ExpectedEndDate = new DateTime(2024, 12, 31),
                ProjectLeadId = 1
            };

            // Gọi đúng route của controller: [HttpPost("create")] trong ProjectController
            var response = await client.PostAsJsonAsync("/api/Project/create", request);

            // 1. Kiểm tra HTTP status
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // 2. Đọc body trả về (Project)
            var createdProject = await response.Content.ReadFromJsonAsync<Project>();
            createdProject.Should().NotBeNull();
            createdProject!.ProjectId.Should().BeGreaterThan(0);
            createdProject.ProjectName.Should().Be(request.ProjectName);
            createdProject.ProjectCode.Should().Be(request.ProjectCode);
            createdProject.ProjectStatusId.Should().Be(request.ProjectStatusId);
            createdProject.ProjectLeadId.Should().Be(request.ProjectLeadId);

            // 3. Kiểm tra dữ liệu đã được lưu vào database InMemory
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var projectInDb = await db.Projects
                .FirstOrDefaultAsync(p => p.ProjectId == createdProject.ProjectId);

            projectInDb.Should().NotBeNull();
            projectInDb!.ProjectName.Should().Be(request.ProjectName);
        }

        [Fact]
        public async Task GetProjectById_Shold_ReturnOk()
        {
            var client = _factory.CreateClient();
            var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var createProject = new Project
            {
                ProjectCode = "PRJ_ex",
                ProjectName = "PROJECT TMDT",
                ProjectStatusId = 1,
                ExpectedStartDate = new DateTime(2025, 1, 1),
                ExpectedEndDate = new DateTime(2025, 12, 31),
                ProjectLeadId = 1
            };

            db.Projects.Add(createProject);
            await db.SaveChangesAsync();

            var CreateProjectId = createProject.ProjectId;
            CreateProjectId.Should().BeGreaterThan(0);

            var response = await client.GetAsync($"/api/Project/{CreateProjectId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var fetchedProject = await response.Content.ReadFromJsonAsync<ProjectResponseDto>();

            // Kiểm tra cơ bản
            fetchedProject.Should().NotBeNull("API phải trả về DTO project hợp lệ");

            // So sánh các field quan trọng
            fetchedProject!.ProjectId.Should().Be(CreateProjectId, "ProjectId phải khớp với ID đã tạo");
            fetchedProject.ProjectCode.Should().Be(createProject.ProjectCode, "Mã project phải giống");
            fetchedProject.ProjectName.Should().Be(createProject.ProjectName, "Tên project phải giống");
            fetchedProject.ProjectStatusId.Should().Be(createProject.ProjectStatusId, "Status ID phải khớp");
            fetchedProject.ProjectLeadId.Should().Be(createProject.ProjectLeadId, "Project Lead ID phải khớp");
            fetchedProject.ExpectedStartDate.Should().Be(createProject.ExpectedStartDate, "Expected Start Date phải khớp");
            fetchedProject.ExpectedEndDate.Should().Be(createProject.ExpectedEndDate, "Expected End Date phải khớp");

            scope.Dispose();
        }

        [Fact]
        public async Task DeleteProject_Should_ReturnOk()
        {
            var client = _factory.CreateClient();
            var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var newProject = new Project
            {
                ProjectCode = "PRJ_ex",
                ProjectName = "PROJECT TMDT",
                ProjectStatusId = 1,
                ExpectedStartDate = new DateTime(2025, 1, 1),
                ExpectedEndDate = new DateTime(2025, 12, 31),
                ProjectLeadId = 1,
                ProjectDeleteStatus = false
            };

            db.Projects.Add(newProject);
            await db.SaveChangesAsync();

            var newProjectId = newProject.ProjectId;
            newProjectId.Should().BeGreaterThan(0);

            var response = await client.DeleteAsync($"/api/project/delete/{newProjectId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var getresponse = await client.GetAsync($"/api/Project/{newProjectId}");
            getresponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

            scope.Dispose();
        }

        [Fact]
        public async Task UpdateProject_Should_returnOk()
        {
            var client = _factory.CreateClient();
            var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var newProject = new Project
            {
                ProjectCode = "PRJ_ex",
                ProjectName = "PROJECT TMDT",
                ProjectStatusId = 1,
                ExpectedStartDate = new DateTime(2025, 1, 1),
                ExpectedEndDate = new DateTime(2025, 12, 31),
                ProjectLeadId = 1,
                ProjectDeleteStatus = false
            };

            db.Projects.Add(newProject);
            await db.SaveChangesAsync();

            var newProjectId = newProject.ProjectId;
            newProjectId.Should().BeGreaterThan(0);
            
            var newRequest = new UpdateProjectRequest
            {
                ProjectCode = "PT_001",
                ProjectName = "PROJECT_Test_001",
                ProjectStatusId = 2,
                ExpectedStartDate = new DateTime(2025, 1, 5),
                ExpectedEndDate = new DateTime(2025, 12, 5),
                ProjectLeadId = 2,
            };
            var response = await client.PatchAsJsonAsync($"/api/project/update/{newProjectId}", newRequest);
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var getresponse = await client.GetAsync($"/api/Project/{newProjectId}");
            getresponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var fetchedProject = await getresponse.Content.ReadFromJsonAsync<ProjectResponseDto>();

            // Kiểm tra cơ bản
            fetchedProject.Should().NotBeNull("API phải trả về DTO project hợp lệ");

            fetchedProject.ProjectCode.Should().Be(newRequest.ProjectCode, "Mã project phải giống");
            fetchedProject.ProjectName.Should().Be(newRequest.ProjectName, "Tên project phải giống");
            fetchedProject.ProjectStatusId.Should().Be(newRequest.ProjectStatusId, "Status ID phải khớp");
            fetchedProject.ProjectLeadId.Should().Be(newRequest.ProjectLeadId, "Project Lead ID phải khớp");
            fetchedProject.ExpectedStartDate.Should().Be(newRequest.ExpectedStartDate, "Expected Start Date phải khớp");
            fetchedProject.ExpectedEndDate.Should().Be(newRequest.ExpectedEndDate, "Expected End Date phải khớp");

            scope.Dispose();
        }
    }
}