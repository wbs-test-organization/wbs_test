using WBS_backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace WBS_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;
        public MemberController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMember()
        {
            try
            {
                var members = await _memberService.GetAllMemberAsync();
                if(members == null)
                {
                    return NotFound(new {message = "khong tim thay member nao"});
                }
                return Ok(members);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi lấy danh sách thành viên", Error = ex.Message });
            }
        }
    }
}