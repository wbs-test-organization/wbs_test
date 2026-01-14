using Microsoft.EntityFrameworkCore;
using WBS_backend.Data;
using WBS_backend.Entities;
using WBS_backend.DTOs.Request;
using WBS_backend.DTOs.Response;
using MailKit.Net.Smtp;
using MimeKit;

namespace WBS_backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;
    public AuthService(AppDbContext context, IJwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }
    public async Task<UserResponse> RegisterAsync(RegisterRequest registerRequest)
    {
        var exists = await _context.Members.AnyAsync(m => m.Email == registerRequest.Email || m.LoginName == registerRequest.LoginName);
        if (exists)
        {
            throw new InvalidOperationException("Tài khoản hoặc email đã tồn tại");
        }
        var activationCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();

        var member = new Member
        {
            MemberFullName = registerRequest.MemberFullName,
            Email = registerRequest.Email,
            LoginName = registerRequest.LoginName,
            Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
            JoinDate = DateTime.UtcNow,
            IsActive = false,
            ActivatedCode = activationCode,
            RoleId = 2
        };

        _context.Members.Add(member);
        await _context.SaveChangesAsync();

        try
        {
            string body = VerificationEmailContent(member);
            await SendEmailAsync(member.Email, "Xác thực tài khoản WBS System", body);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Xác thực email thất bại: {ex.Message}");
        }

        return new UserResponse
        {
            MemberId = member.MemberId,
            MemberFullName = member.MemberFullName,
            Email = member.Email,
            LoginName = member.LoginName,
            RoleId = member.RoleId,
            IsActive = member.IsActive
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest loginRequest)
    {
        var member = await _context.Members.FirstOrDefaultAsync(m => m.LoginName == loginRequest.LoginName);
        if (member == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, member.Password))
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Tên đăng nhập hoặc mật khẩu không đúng"
            };
        }
        var token = _jwtService.GenerateToken(member);

        return new AuthResponseDto
        {
            Token = token,
            Success = true,
            Message = "Đăng nhập thành công",
            Member = new UserResponse
            {
                MemberId = member.MemberId,
                MemberFullName = member.MemberFullName,
                Email = member.Email,
                LoginName = member.LoginName,
                RoleId = member.RoleId,
                IsActive = member.IsActive
            }
        };
    }

    public async Task<UserResponse> VerifyEmailAsync(string email, string code)
    {
        var member = await _context.Members.FirstOrDefaultAsync(m => m.Email == email && m.ActivatedCode == code);
        if (member == null)
        {
            throw new InvalidOperationException("Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        member.IsActive = true;

        await _context.SaveChangesAsync();

        return new UserResponse
        {
            MemberId = member.MemberId,
            MemberFullName = member.MemberFullName,
            Email = member.Email,
            LoginName = member.LoginName,
            RoleId = member.RoleId,
            IsActive = true
        };
    }

    public async Task ForgotPassword(string email)
    {
        var member = await _context.Members.FirstOrDefaultAsync(m => m.Email == email);
        if (member == null)
        {
            return;
        }

        member.ResetCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
        await _context.SaveChangesAsync();

        string body = ChangePasswordContent(member);
        await SendEmailAsync(member.Email, "Đặt lại mật khẩu WBS System", body);
    }

    public async Task<bool> ResetPassword(string email, string resetCode, string newPassword, string confirmPassword)
    {
        if(newPassword != confirmPassword)
        {
            throw new InvalidOperationException("Mật khẩu mới xác nhận không khớp");
        }

        var member = await _context.Members.FirstOrDefaultAsync(m => m.Email == email && m.ResetCode == resetCode);
        if (member == null)
        {
            throw new InvalidOperationException("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
        }
        member.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        member.ResetCode = null;
        
        await _context.SaveChangesAsync();

        return true;
    }
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_configuration["Smtp:Username"]));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_configuration["Smtp:Host"], int.Parse(_configuration["Smtp:Port"]), MailKit.Security.SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_configuration["Smtp:Username"], _configuration["Smtp:Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    public static string VerificationEmailContent(Member member)
    {
        var verifyLink = $"http://localhost:3000/verify-email?code={member.ActivatedCode}&email={Uri.EscapeDataString(member.Email)}";

        return $"""
        <h2>Xin chào {member.MemberFullName},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>WBS System</strong>.</p>
        <p>Vui lòng click vào nút dưới đây để xác thực email của bạn (link có hiệu lực trong 24 giờ):</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{verifyLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               XÁC NHẬN EMAIL
            </a>
        </p>
        <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
        <hr>
        <small>Mã xác thực (dự phòng): <strong>{member.ActivatedCode}</strong></small>
        """;
    }

    public static string ChangePasswordContent(Member member)
    {
        var verifyLink = $"http://localhost:3000/reset-password?code={member.ResetCode}&email={Uri.EscapeDataString(member.Email)}";

        return $"""
        <h2>Xin chào {member.MemberFullName},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>WBS System</strong>.</p>
        <p>Vui lòng click vào nút dưới đây để thay đổi mật khẩu (link có hiệu lực trong 24 giờ):</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{verifyLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               CHANGE PASSWORD
            </a>
        </p>
        <p>Nếu bạn không thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
        <hr>
        <small>Mã xác thực (dự phòng): <strong>{member.ResetCode}</strong></small>
        """;
    }
}