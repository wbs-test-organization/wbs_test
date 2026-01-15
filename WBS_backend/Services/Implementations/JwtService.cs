using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WBS_backend.Entities;
using System;

namespace WBS_backend.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Member member)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, member.MemberId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, member.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, member.MemberId.ToString()),
            new Claim(ClaimTypes.Name, member.LoginName),
            new Claim(ClaimTypes.Role, member.RoleId?.ToString() ?? "2"),
            new Claim("fullName", member.MemberFullName),
            new Claim("loginName", member.LoginName)
        };

        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? throw new InvalidOperationException("JWT_SECRET environment variable is required for JWT signing.");

        if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
        {
            throw new InvalidOperationException("JWT_SECRET must be set and at least 32 characters long.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int? ValidateToken(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["JWT_SECRET"]!);

        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var memberId = int.Parse(jwtToken.Claims.First(x => x.Type == JwtRegisteredClaimNames.Sub).Value);

            return memberId;
        }
        catch
        {
            return null;
        }
    }
}
