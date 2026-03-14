using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IActivityLogService _activityLogService;
        private readonly IWebHostEnvironment _env;

        public BooksController(IBookService bookService, IActivityLogService activityLogService, IWebHostEnvironment env)
        {
            _bookService = bookService;
            _activityLogService = activityLogService;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetBooks(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "id")
        {
            var (books, total) = await _bookService.GetBooksAsync(search, categoryId, pageNumber, pageSize, sortBy);
            return Ok(new { data = books, total, pageNumber, pageSize });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookResponseDto>> GetBookById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
                return NotFound(new { message = "Book not found" });

            return Ok(book);
        }

        [HttpPost]
        [Authorize(Policy = "LibrarianOnly")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BookResponseDto>> CreateBook([FromForm] BookCreateDto dto, IFormFile? imageFile)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            string? imageUrl = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                imageUrl = await SaveBookImageAsync(imageFile);
                if (imageUrl == null)
                    return BadRequest(new { message = "Invalid image file. Only JPG, JPEG, PNG, GIF, and WEBP are allowed." });
            }

            var book = await _bookService.CreateBookAsync(dto, imageUrl);

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            await _activityLogService.LogActivityAsync("Added Book", book!.Title, userName);

            return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "LibrarianOnly")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BookResponseDto>> UpdateBook(int id, [FromForm] BookUpdateDto dto, IFormFile? imageFile)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            string? imageUrl = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                imageUrl = await SaveBookImageAsync(imageFile);
                if (imageUrl == null)
                    return BadRequest(new { message = "Invalid image file. Only JPG, JPEG, PNG, GIF, and WEBP are allowed." });
            }

            var book = await _bookService.UpdateBookAsync(id, dto, imageUrl);
            if (book == null)
                return NotFound(new { message = "Book not found" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            await _activityLogService.LogActivityAsync("Updated Book", book.Title, userName);

            return Ok(book);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            var result = await _bookService.DeleteBookAsync(id);
            if (!result)
                return NotFound(new { message = "Book not found" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            await _activityLogService.LogActivityAsync("Deleted Book", book?.Title ?? $"ID: {id}", userName);

            return NoContent();
        }

        /// <summary>
        /// Saves an uploaded image file to wwwroot/uploads/books/ and returns the relative URL.
        /// Returns null if the file type is not allowed.
        /// </summary>
        private async Task<string?> SaveBookImageAsync(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return null;

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(webRoot, "uploads", "books");
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadDir, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/uploads/books/{fileName}";
        }
    }
}
