using WBS_backend.DTOs;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;

namespace WBS_backend.Services
{
    public interface IProjectStatusService
    {
        Task<List<ProjectStatusResponse>> GetAllProjectStatusAsync();
        Task<ProjectStatusResponse> GetProjectStatusByIdAsync(int statusId);
    }
}