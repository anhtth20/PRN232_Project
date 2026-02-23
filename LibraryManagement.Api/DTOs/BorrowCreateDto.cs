namespace LibraryManagement.Api.DTOs
{
    public class BorrowCreateDto
    {
        public int BookId { get; set; }
        public DateTime DueDate { get; set; }
    }
}
