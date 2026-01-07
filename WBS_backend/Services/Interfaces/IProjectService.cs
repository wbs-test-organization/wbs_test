using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;

namespace WBS_backend.Services
{
    public interface IProjectService
    {
        Task<List<ProjectResponseDto>> GetAllProjectAsync();
        Task<Project> CreateProject(CreateProjectRequest createProjectRequest);
        Task<Project> UpdateProject(int idProject, UpdateProjectRequest value);
        Task<ProjectResponseDto?> GetProjectByIdAsync(int id);
        Task<bool> DeleteProjectByIdAsync(int id);
    }
}