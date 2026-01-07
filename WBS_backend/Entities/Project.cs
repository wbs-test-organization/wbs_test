using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace WBS_backend.Entities
{
    [Table("tbl_project")]
    public class Project
    {
        [Key]
        [Column("project_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectId { get; set; }

        [Required]
        [Column("project_code")]
        [StringLength(255)]
        public string ProjectCode { get; set;} = string.Empty;

        [Required]
        [Column("project_name")]
        [StringLength(255)]
        public string ProjectName { get; set;} = string.Empty;

        [Column("expected_start_date")]
        public DateTime? ExpectedStartDate { get; set;} 

        [Column("expected_end_date")]
        public DateTime? ExpectedEndDate { get; set;}

        [Column("actual_start_date")]
        public DateTime? ActualStartDate { get; set;}  

        [Column("actual_end_date")]
        public DateTime? ActualEndDate { get; set;}

        [Column("work_progress", TypeName = "decimal(6,2)")]
        public decimal WorkProgress {get; set;} = 0.00m;

        [Column("estimate_time")]
        public double? EstimateTime {get; set;}

        [Column("spent_time")]
        public double? SpentTime {get; set;}

        [Column("project_delete_status")]
        public bool ProjectDeleteStatus {get; set;} = false;

        [Column("member_author_id")]
        public int? MemberAuthorId {get; set;}

        [Column("project_status_id")]
        public int? ProjectStatusId {get; set;}
        [ForeignKey("ProjectStatusId")]
        public virtual ProjectStatus? ProjectStatus { get; set; }
    }
}