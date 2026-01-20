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
    public class ProjectStatusIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public ProjectStatusIntegrationTests(WebApplicationFactory<Program> factory)
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
        public async Task GetAllProjectStatus_Should_ReturnOk()
        {
            var client = _factory.CreateClient();
            var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var project_status = new ProjectStatus
            {
              StatusName = "name_status_test",
              StatusDescription = "description_status_test",
              StatusColor = "blue",
              IsActive = true  
            };
            db.ProjectStatus.Add(project_status);
            await db.SaveChangesAsync();

            var project_status_id = project_status.ProjectStatusId;
            project_status_id.Should().BeGreaterThan(0);

            var response = await client.GetAsync($"/api/projectstatus/");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            scope.Dispose();
        }

        [Fact]
        public async Task GetProjectStatusById_Should_ReturnOk()
        {
                        var client = _factory.CreateClient();
            var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var project_status = new ProjectStatus
            {
              StatusName = "name_status_test",
              StatusDescription = "description_status_test",
              StatusColor = "blue",
              IsActive = true  
            };
            db.ProjectStatus.Add(project_status);
            await db.SaveChangesAsync();

            var project_status_id = project_status.ProjectStatusId;
            project_status_id.Should().BeGreaterThan(0);

            var response = await client.GetAsync($"/api/projectstatus/{project_status_id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var fetchedProjectStatus = await response.Content.ReadFromJsonAsync<ProjectStatusResponse>();
            fetchedProjectStatus.Should().NotBeNull();
            fetchedProjectStatus!.ProjectStatusId.Should().BeGreaterThan(0);
            fetchedProjectStatus.StatusName.Should().Be(project_status.StatusName);
            fetchedProjectStatus.StatusDescription.Should().Be(project_status.StatusDescription);
            fetchedProjectStatus.StatusColor.Should().Be(project_status.StatusColor);
            fetchedProjectStatus.IsActive.Should().Be(project_status.IsActive);

            scope.Dispose();
        }

    }
}