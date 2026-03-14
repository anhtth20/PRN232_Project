namespace LibraryManagement.Api.DTOs
{
    public class BookUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public int CategoryId { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
    }
}
