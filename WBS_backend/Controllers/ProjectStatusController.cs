using Microsoft.AspNetCore.Authorization;
using WBS_backend.Services;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.DTOs.RequestDTOs;

namespace WBS_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class ProjectStatusController : ControllerBase
    {
        private readonly IProjectStatusService _projectStatusService;
        public ProjectStatusController(IProjectStatusService projectStatusService)
        {
            _projectStatusService = projectStatusService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAllProjectStatus()
        {
            var result = await _projectStatusService.GetAllProjectStatusAsync();
            return Ok(result);
        }

        [HttpGet("{statusId}")]
        public async Task<IActionResult> GetProjectStatusById(int statusId)
        {
            var result = await _projectStatusService.GetProjectStatusByIdAsync(statusId);
            if (result == null)
            {
                return NotFound(new { message = $"Project status with ID '{statusId}' not found." });
            }
            return Ok(result);
        }
    }
}