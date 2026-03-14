using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Api.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Details { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? MemberName { get; set; }

        public DateTime Timestamp { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Completed";
    }
}
