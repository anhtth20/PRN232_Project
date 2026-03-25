namespace LibraryManagement.Api.Models
{
    public class BorrowRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime DueDate { get; set; }
        public int RenewCount { get; set; } = 0;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Returned, Cancelled

        // Foreign keys
        public User? User { get; set; }
        public Book? Book { get; set; }

        // Navigation property
        public ICollection<Fine> Fines { get; set; } = new List<Fine>();
    }
}
