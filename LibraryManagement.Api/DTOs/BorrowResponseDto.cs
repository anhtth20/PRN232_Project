namespace LibraryManagement.Api.DTOs
{
    public class BorrowResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public string? BookTitle { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
