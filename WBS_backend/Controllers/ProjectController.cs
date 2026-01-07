using WBS_backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using WBS_backend.Services;
using Microsoft.AspNetCore.Mvc;
using WBS_backend.DTOs.RequestDTOs;
using WBS_backend.Entities;

namespace WBS_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetProjects()
        {
            var result = await _projectService.GetAllProjectAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            try{
                var result = await _projectService.GetProjectByIdAsync(id);
                if(result == null)
                {
                    return NotFound(new{ message = $"khong tim thay du an voi ID = {id}"});
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }


        [HttpPost("create")]
        public async Task<IActionResult> PostProject([FromBody]CreateProjectRequest createProjectRequest)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try{
                var result = await _projectService.CreateProject (createProjectRequest);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpPatch("update/{id}")]
        public async Task<IActionResult> PatchProjectById(int id, [FromBody]UpdateProjectRequest value)
        {
            try
            {
                var result = await _projectService.UpdateProject (id, value);
                return Ok(new {message = "Update thanh cong", Project = result});
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpDelete("delete{id}")]
        public async Task<IActionResult> DeleteProjectById(int id)
        {
            try
            {
                var result = await _projectService.DeleteProjectByIdAsync(id);
                if (result == false)
                {
                    return BadRequest(new {message = "khong tim thay project, hoac project da bi xoa"});
                }
                return Ok(result);
                
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}