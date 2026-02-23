namespace LibraryManagement.Api.DTOs
{
    public class BookCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int Quantity { get; set; }
    }
}
