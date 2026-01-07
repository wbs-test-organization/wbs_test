using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WBS_backend.DTOs.RequestDTOs
{
    public class UpdateProjectRequest
    {
        public string? ProjectCode {get; set;}
        public string? ProjectName {get; set;}
        public DateTime? ExpectedStartDate {get; set;}
        public DateTime? ExpectedEndDate {get; set;}
        public DateTime? ActualStartDate {get; set;}
        public DateTime? ActualEndDate {get; set;}
        public decimal? WorkProgress {get; set;}
        public double? EstimateTime {get; set;}
        public double? SpentTime {get; set;}
        public int? ProjectStatusId {get; set;}
    }
}