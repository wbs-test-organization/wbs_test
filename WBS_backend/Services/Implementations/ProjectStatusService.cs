using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.DTOs;

namespace WBS_backend.Services
{
    public class ProjectStatusService : IProjectStatusService
    {
        private readonly AppDbContext _context;
        public ProjectStatusService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectStatusResponse>> GetAllProjectStatusAsync()
        {
            return await _context.ProjectStatus
                .Select(ps => new ProjectStatusResponse
                {
                    ProjectStatusId = ps.ProjectStatusId,
                    StatusName = ps.StatusName,
                    StatusDescription = ps.StatusDescription,
                    StatusColor = ps.StatusColor,
                    SortOrder = ps.SortOrder,
                    IsActive = ps.IsActive
                })
                .ToListAsync();
        }

        public async Task<ProjectStatusResponse> GetProjectStatusByIdAsync(int statusId)
        {
            var ps = await _context.ProjectStatus
                .FirstOrDefaultAsync(ps => ps.ProjectStatusId == statusId);

            if (ps == null)
            {
                return null;
            }

            return new ProjectStatusResponse
            {
                ProjectStatusId = ps.ProjectStatusId,
                StatusName = ps.StatusName,
                StatusDescription = ps.StatusDescription,
                StatusColor = ps.StatusColor,
                SortOrder = ps.SortOrder,
                IsActive = ps.IsActive
            };
        }
    }
}