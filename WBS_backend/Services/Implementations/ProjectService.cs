using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;

namespace WBS_backend.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;
        public ProjectService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ProjectResponseDto>> GetAllProjectAsync()
        {
            return await _context.Projects
                .Select(p => new ProjectResponseDto
                {
                    ProjectId = p.ProjectId,
                    ProjectCode = p.ProjectCode,
                    ProjectName = p.ProjectName,
                    ExpectedStartDate = p.ExpectedStartDate,
                    ExpectedEndDate = p.ExpectedEndDate,
                    ActualStartDate = p.ActualStartDate,
                    ActualEndDate = p.ActualEndDate,
                    WorkProgress = p.WorkProgress,
                    EstimateTime = p.EstimateTime,
                    SpentTime = p.SpentTime,
                    ProjectDeleteStatus = p.ProjectDeleteStatus,
                    MemberAuthorId = p.MemberAuthorId,
                    ProjectStatusId = p.ProjectStatusId
                })
                .OrderByDescending(p => p.ProjectId)
                .ToListAsync();
        }

        public async Task<Project> CreateProject(CreateProjectRequest createProjectRequest)
        {
            var project = new Project
            {
                ProjectCode = createProjectRequest.ProjectCode,
                ProjectName = createProjectRequest.ProjectName,
                ProjectStatusId = createProjectRequest.ProjectStatusId,
                ExpectedStartDate = createProjectRequest.ExpectedStartDate,
                ExpectedEndDate = createProjectRequest.ExpectedEndDate,
                MemberAuthorId = createProjectRequest.MemberAuthorId
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return project;
            
        }

        public async Task<Project> UpdateProject(int idProject, UpdateProjectRequest value)
        {   

            var project = await _context.Projects.FindAsync(idProject);
            if (project == null || project.ProjectDeleteStatus)
                throw new KeyNotFoundException("Không tìm thấy dự án.");
            if (value.ProjectCode != null) project.ProjectCode = value.ProjectCode;
            if (value.ProjectName != null) project.ProjectName = value.ProjectName;
            if (value.ExpectedStartDate.HasValue) project.ExpectedStartDate = value.ExpectedStartDate;
            if (value.ExpectedEndDate.HasValue) project.ExpectedEndDate = value.ExpectedEndDate;
            if (value.ActualStartDate.HasValue) project.ActualStartDate = value.ActualStartDate;
            if (value.ActualEndDate.HasValue) project.ActualEndDate = value.ActualEndDate;
            if (value.WorkProgress.HasValue) project.WorkProgress = value.WorkProgress.Value;
            if (value.EstimateTime.HasValue) project.EstimateTime = value.EstimateTime;
            if (value.SpentTime.HasValue) project.SpentTime = value.SpentTime;
            if (value.ProjectStatusId.HasValue) project.ProjectStatusId = value.ProjectStatusId;

            await _context.SaveChangesAsync();
            return project;
        }
        public async Task<ProjectResponseDto?> GetProjectByIdAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.ProjectStatus)
                .Where(p => p.ProjectId == id && !p.ProjectDeleteStatus)
                .Select(p => new ProjectResponseDto
                {
                    ProjectId = p.ProjectId,
                    ProjectCode = p.ProjectCode,
                    ProjectName = p.ProjectName,
                    ExpectedStartDate = p.ExpectedStartDate,
                    ExpectedEndDate = p.ExpectedEndDate,
                    ActualStartDate = p.ActualStartDate,
                    ActualEndDate = p.ActualEndDate,
                    WorkProgress = p.WorkProgress,
                    EstimateTime = p.EstimateTime,
                    SpentTime = p.SpentTime,
                    ProjectStatusId = p.ProjectStatusId,
                    ProjectStatusName = p.ProjectStatus != null ? p.ProjectStatus.StatusName : "Chưa xác định",
                    MemberAuthorId = p.MemberAuthorId
                })
                .FirstOrDefaultAsync();
        }
        public async Task<bool> DeleteProjectByIdAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null || project.ProjectDeleteStatus)
            {
                return false; 
            }
            project.ProjectDeleteStatus = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}