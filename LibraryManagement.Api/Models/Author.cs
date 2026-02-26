namespace LibraryManagement.Api.Models
{
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation property
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
