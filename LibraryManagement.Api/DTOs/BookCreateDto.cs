namespace LibraryManagement.Api.DTOs
{
    public class BookCreateDto
    {
        public required string Title { get; set; }
        public required int AuthorId { get; set; }
        public required int CategoryId { get; set; }
        public required int Quantity { get; set; }
        public string? Description { get; set; }
    }
}
