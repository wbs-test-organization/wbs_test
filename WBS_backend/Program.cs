using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json.Converters;
using WBS_backend.Data;
using WBS_backend.Services;
using dotenv.net;
using WBS_backend.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// =========================
// Load Environment Variables from .env files
// =========================
if (File.Exists("mail.env"))
{
    DotEnv.Load(options: new DotEnvOptions(envFilePaths: new[] { "mail.env" }));
    Console.WriteLine("Loaded environment variables from: mail.env");
}
// Khi chạy local (dotnet run), load từ .env.local
// Khi build Docker, sử dụng production.env (được copy vào container)
var envFile = builder.Environment.IsDevelopment() ? ".env.local" : "production.env";
if (File.Exists(envFile))
{
    DotEnv.Load(options: new DotEnvOptions(envFilePaths: new[] { envFile }));
    Console.WriteLine($"Loaded environment variables from: {envFile}");
}
else
{
    Console.WriteLine($"Environment file not found: {envFile}, using system environment variables");
}

// =========================
// Database Configuration
// =========================
// Ưu tiên lấy connection string từ environment variable, fallback về appsettings.json
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));

// =========================
// JWT Authentication
// =========================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Đọc JWT secret trực tiếp từ ENV (không dùng configuration["Jwt:Key"])
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? throw new InvalidOperationException(
                "JWT_SECRET environment variable is required. " +
                "Please set it in production.env or when running Docker with -e JWT_SECRET=...");

        // Kiểm tra độ dài key để đảm bảo an toàn (ít nhất 256 bits cho HS256)
        if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT_SECRET must be at least 32 characters long for secure signing.");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt:Issuer is required."),
            ValidAudience = builder.Configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt:Audience is required."),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// =========================
// Controllers & JSON
// =========================
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Converters.Add(new StringEnumConverter()); // Enum as string
    });

// =========================
// Swagger Configuration
// =========================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ProjectManage API",
        Version = "v1",
        Description = "API quản lý dự án"
    });

    // JWT Bearer Authorization
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// =========================
// Dependency Injection - Services
// =========================
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectStatusService, ProjectStatusService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IProjectMemberService, ProjectMemberService>();
// builder.Services.AddScoped<IMemberService, MemberService>();

// =========================
// CORS Configuration
// =========================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// =========================
// Middleware Pipeline
// =========================
    // if (app.Environment.IsDevelopment())
    // {
    //     app.UseSwagger();
    //     app.UseSwaggerUI(c =>
    //     {
    //         c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProjectManage API v1");
    //     });
    // }
app.UseSwagger();
app.UseSwaggerUI();
// app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }