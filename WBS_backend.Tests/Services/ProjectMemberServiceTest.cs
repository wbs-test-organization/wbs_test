using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;
using WBS_backend.Services;

namespace WBS_backend.Tests.Services
{
    public class ProjectMemberServiceTest : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly ProjectMemberService _service;

        public ProjectMemberServiceTest()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new ProjectMemberService(_context);

            // Seed dữ liệu cơ bản cần thiết cho mọi test
            SeedRequiredData();
        }

        private void SeedRequiredData()
        {
            if (!_context.Projects.Any(p => p.ProjectId == 3))
            {
                _context.Projects.Add(new Project
                {
                    ProjectId = 3,
                    ProjectName = "Dự án Test Unit",
                    ProjectCode = "TEST-001",
                });
            }
            if (!_context.Members.Any(m => m.MemberId == 1))
            {
                _context.Members.Add(new Member
                {
                    MemberId = 1,
                    LoginName = "testuser",
                    MemberFullName = "Nguyễn Văn Test",
                    Email = "test@example.com",
                    IsActive = true
                   
                });
            }

            _context.SaveChanges();
        }

        [Fact(DisplayName = "AddMemberForProjectId → Khi project và member tồn tại, chưa tham gia → Tạo mới thành công và trả về thông tin đúng")]
        public async Task AddMember_Should_CreateNewParticipation_And_ReturnCorrectData()
        {
            var request = new ProjectMemberRequest
            {
                MemberId = 1,
                RoleId = 1,
                StartDate = new DateTime(2024, 2, 1),
                EndDate = new DateTime(2024, 2, 1),
                IsCurrent = true
            };

            var result = await _service.AddMemberForProjectId(3, request);

            result.Should().NotBeNull("Kết quả trả về không được null");
            result.MemberId.Should().Be(1);
            result.RoleId.Should().Be(1);
            result.MemberFullName.Should().Be("Nguyễn Văn Test");
            result.StartDate.Should().Be(new DateTime(2024, 2, 1));
            result.EndDate.Should().Be(new DateTime(2024, 2, 1));
            result.IsCurrent.Should().BeTrue();

            var savedParticipation = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == 3 && pm.MemberId == 1);

            savedParticipation.Should().NotBeNull("Bản ghi phải được lưu vào database");
            savedParticipation!.ProjectId.Should().Be(3);
            savedParticipation.MemberId.Should().Be(1);
            savedParticipation.StartDate.Should().Be(new DateTime(2024, 2, 1));
            savedParticipation.EndDate.Should().Be(new DateTime(2024, 2, 1));
            savedParticipation.IsCurrent.Should().BeTrue();
        }

        [Fact(DisplayName = "AddMemberForProjectId → Khi project không tồn tại → Ném KeyNotFoundException")]
        public async Task AddMember_WhenProjectNotExists_Should_ThrowKeyNotFoundException()
        {
            var request = new ProjectMemberRequest
            {
                MemberId = 1,
                RoleId = 1,
                StartDate = DateTime.Today,
                IsCurrent = true
            };

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.AddMemberForProjectId(999, request));
                }

        [Fact(DisplayName = "AddMemberForProjectId → Khi member không tồn tại → Ném KeyNotFoundException")]
        public async Task AddMember_WhenMemberNotExists_Should_ThrowKeyNotFoundException()
        {
            var request = new ProjectMemberRequest
            {
                MemberId = 999,
                RoleId = 1,
                StartDate = DateTime.Today,
                IsCurrent = true
            };

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.AddMemberForProjectId(3, request));
        }

        [Fact(DisplayName = "AddMemberForProjectId → Khi member đã tồn tại trong project → Ném KeyNotFoundException")]
        public async Task AddMember_WhenDuplicate_Should_ThrowKeyNotFoundException()
        {
            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = 3,
                MemberId = 1,
                RoleId = 1,
                StartDate = DateTime.Today,
                IsCurrent = true
            });
            await _context.SaveChangesAsync();

            var request = new ProjectMemberRequest
            {
                MemberId = 1,
                RoleId = 1,
                StartDate = DateTime.Today,
                IsCurrent = true
            };

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.AddMemberForProjectId(3, request));
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}