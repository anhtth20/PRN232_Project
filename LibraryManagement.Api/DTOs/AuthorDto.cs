namespace LibraryManagement.Api.DTOs
{
    public class AuthorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
    }

    public class AuthorCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
    }
}
