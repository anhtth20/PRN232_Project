namespace LibraryManagement.Api.Models
{
    public class Fine
    {
        public int Id { get; set; }
        public int BorrowRequestId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Unpaid"; // "Unpaid" or "Paid" only
        public string Reason { get; set; } = string.Empty;

        // Foreign key
        public BorrowRequest? BorrowRequest { get; set; }
    }
}
