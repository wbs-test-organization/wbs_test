namespace WBS_backend.DTOs
{
    public class ProjectStatusResponse
    {
        public int ProjectStatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string? StatusDescription { get; set; }
        public string? StatusColor { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
    }
}