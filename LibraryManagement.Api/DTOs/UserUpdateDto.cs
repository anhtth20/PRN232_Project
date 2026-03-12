namespace LibraryManagement.Api.DTOs
{
    public class UserUpdateDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
