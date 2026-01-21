using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.Entities;
using WBS_backend.Services;

namespace WBS_backend.Tests.Services
{
    public class MemberServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly MemberService _service;

        public MemberServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new MemberService(_context);
        }

        [Fact]
        public async Task GetAllMemberAsync_Should_Return_Only_Active_Members_Ordered_By_Id_Desc()
        {
            _context.Members.AddRange(
                new Member { MemberId = 1, LoginName = "u1", Email = "u1@test.com", MemberFullName = "User 1", IsActive = true },
                new Member { MemberId = 2, LoginName = "u2", Email = "u2@test.com", MemberFullName = "User 2", IsActive = true },
                new Member { MemberId = 3, LoginName = "u3", Email = "u3@test.com", MemberFullName = "User 3", IsActive = false }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetAllMemberAsync();

            result.Should().HaveCount(2);
            result.Select(m => m.MemberId).Should().ContainInOrder(2, 1);
        }

        [Fact]
        public async Task GetAllMemberAsync_Should_Return_Empty_List_When_No_Active_Member()
        {
            _context.Members.Add(new Member
            {
                MemberId = 10,
                LoginName = "inactive",
                Email = "inactive@test.com",
                MemberFullName = "Inactive",
                IsActive = false
            });
            await _context.SaveChangesAsync();

            var result = await _service.GetAllMemberAsync();

            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
