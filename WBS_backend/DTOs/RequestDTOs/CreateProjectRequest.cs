using Newtonsoft.Json;

namespace WBS_backend.DTOs.RequestDTOs
{
    public class CreateProjectRequest
    {
        public string ProjectCode {get; set;} = string.Empty;
        public string ProjectName {get; set;} = string.Empty;
        public int ProjectStatusId {get; set;}
        public DateTime? ExpectedStartDate {get; set;}
        public DateTime? ExpectedEndDate {get; set;}
        public int MemberAuthorId {get; set;}
    }
}