using Microsoft.EntityFrameworkCore;
using WBS_backend.Entities;

namespace WBS_backend.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Member> Members { get; set; }
    public DbSet<Project> Projects {get; set; }
    public DbSet<ProjectStatus> ProjectStatus {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Member>(entity =>
        {
            entity.ToTable("tbl_member");
            entity.HasIndex(m => m.Email).IsUnique();
            entity.HasIndex(m => m.LoginName).IsUnique();
            entity.Property(m => m.JoinDate)
              .HasDefaultValueSql("CURRENT_TIMESTAMP")
              .ValueGeneratedOnAdd();

            entity.Property(m => m.IsActive)
                .HasDefaultValue(false);
        });
        modelBuilder.Entity<Project>(entity =>
        {
           entity.ToTable("tbl_project");
           entity.HasKey(p => p.ProjectId);
           entity.Property(p => p.ProjectId).HasColumnName("project_id").ValueGeneratedOnAdd();
           entity.Property(p => p.ProjectCode).HasColumnName("project_code");
           entity.Property(p => p.ProjectName).HasColumnName("project_name");
           entity.Property(p => p.ExpectedStartDate).HasColumnName("expected_start_date");
           entity.Property(p => p.ExpectedEndDate).HasColumnName("expected_end_date");
           entity.Property(p => p.ActualStartDate).HasColumnName("actual_start_date");
           entity.Property(p => p.ActualEndDate).HasColumnName("actual_end_date");
           entity.Property(p => p.WorkProgress)
            .HasColumnName("work_progress")
            .HasColumnType("decimal(6,2)")
            .HasDefaultValue(0.00m);
           entity.Property(p => p.EstimateTime).HasColumnName("estimate_time")
            .HasColumnType("double");
           entity.Property(p => p.SpentTime).HasColumnName("spent_time")
            .HasColumnType("double");
           entity.Property(p => p.ProjectDeleteStatus)
            .HasColumnName("project_delete_status")
            .HasDefaultValue(false);
           entity.Property(p => p.MemberAuthorId).HasColumnName("member_author_id");
           entity.Property(p => p.ProjectStatusId).HasColumnName("project_status_id");
        });

        modelBuilder.Entity<ProjectStatus>(entity =>
        {
            entity.ToTable("tbl_project_status");
            entity.HasKey(ps => ps.ProjectStatusId);
            entity.Property(ps => ps.ProjectStatusId).HasColumnName("project_status_id").ValueGeneratedOnAdd();
            entity.Property(ps => ps.StatusName).HasColumnName("status_name");
            entity.Property(ps => ps.StatusDescription).HasColumnName("status_description");
            entity.Property(ps => ps.StatusColor).HasColumnName("status_color");
            entity.Property(ps => ps.SortOrder).HasColumnName("sort_order");
            entity.Property(ps => ps.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);
        });
    } 
}