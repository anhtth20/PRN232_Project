namespace LibraryManagement.Api.DTOs
{
    public class FineCreateDto
    {
        public int BorrowRequestId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
