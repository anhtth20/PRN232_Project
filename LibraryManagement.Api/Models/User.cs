using LibraryManagement.Api.Services;

namespace LibraryManagement.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; // Default password, should be changed on first login
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; } // Librarian or Borrower
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
    }
}
