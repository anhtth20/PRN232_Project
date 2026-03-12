namespace LibraryManagement.Api.Models
{
    public class Fine
    {
        public int Id { get; set; }
        public int BorrowRequestId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending"; // Pending, Cleared

        // Foreign key
        public BorrowRequest? BorrowRequest { get; set; }
    }
}
