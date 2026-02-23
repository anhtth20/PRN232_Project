namespace LibraryManagement.Api.DTOs
{
    public class FineResponseDto
    {
        public int Id { get; set; }
        public int BorrowRequestId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
