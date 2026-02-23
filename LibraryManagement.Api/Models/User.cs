namespace LibraryManagement.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; } // Librarian or Borrower
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
    }
}
