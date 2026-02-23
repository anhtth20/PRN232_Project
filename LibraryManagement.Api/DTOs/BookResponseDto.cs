namespace LibraryManagement.Api.DTOs
{
    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
