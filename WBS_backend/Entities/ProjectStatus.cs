using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WBS_backend.Entities
{
    [Table("tbl_project_status")]
    public class ProjectStatus
    {
        [Key]
        [Column("project_status_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectStatusId { get; set; }

        [Required]
        [Column("status_name")]
        [StringLength(100)]
        public string StatusName { get; set; } = string.Empty;

        [Column("status_description")]
        public string? StatusDescription { get; set; }

        [Column("status_color")]
        [StringLength(20)]
        public string? StatusColor { get; set; }

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        
    }
}