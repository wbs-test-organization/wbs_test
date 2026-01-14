using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace WBS_backend.DTOs.Request
{
    public class ResetPasswordRequest
    {
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}