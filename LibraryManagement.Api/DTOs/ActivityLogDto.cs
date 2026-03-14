using System;

namespace LibraryManagement.Api.DTOs
{
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string? MemberName { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = "Completed";
    }
}
