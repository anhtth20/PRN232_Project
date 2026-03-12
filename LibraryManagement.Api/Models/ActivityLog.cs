using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Api.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } // e.g., "Borrowed", "Returned", "Registered", "Issued Fine", "Added Book"

        [MaxLength(200)]
        public string Details { get; set; } // e.g., "The Great Gatsby" or "Member John Doe"

        [MaxLength(100)]
        public string MemberName { get; set; } // Optional: Who was involved in this action?

        public DateTime Timestamp { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } // e.g., "Completed", "Pending", "Failed"
    }
}
