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

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
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
        public async Task<ActionResult<BookResponseDto>> CreateBook([FromBody] BookCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            var book = await _bookService.CreateBookAsync(dto);
            return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<BookResponseDto>> UpdateBook(int id, [FromBody] BookUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            var book = await _bookService.UpdateBookAsync(id, dto);
            if (book == null)
                return NotFound(new { message = "Book not found" });

            return Ok(book);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var result = await _bookService.DeleteBookAsync(id);
            if (!result)
                return NotFound(new { message = "Book not found" });

            return NoContent();
        }
    }
}
