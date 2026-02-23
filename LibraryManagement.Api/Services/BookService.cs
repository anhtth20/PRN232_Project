using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Services
{
    public interface IBookService
    {
        Task<(IEnumerable<BookResponseDto> books, int total)> GetBooksAsync(string? search, int pageNumber = 1, int pageSize = 10, string sortBy = "id");
        Task<BookResponseDto?> GetBookByIdAsync(int id);
        Task<BookResponseDto?> CreateBookAsync(BookCreateDto dto);
        Task<BookResponseDto?> UpdateBookAsync(int id, BookUpdateDto dto);
        Task<bool> DeleteBookAsync(int id);
    }

    public class BookService : IBookService
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<BookResponseDto> books, int total)> GetBooksAsync(string? search, int pageNumber = 1, int pageSize = 10, string sortBy = "id")
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search));
            }

            var total = await query.CountAsync();

            query = sortBy.ToLower() switch
            {
                "title" => query.OrderBy(b => b.Title),
                "author" => query.OrderBy(b => b.Author),
                "quantity" => query.OrderBy(b => b.Quantity),
                _ => query.OrderBy(b => b.Id)
            };

            var books = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => MapToDto(b))
                .ToListAsync();

            return (books, total);
        }

        public async Task<BookResponseDto?> GetBookByIdAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            return book != null ? MapToDto(book) : null;
        }

        public async Task<BookResponseDto?> CreateBookAsync(BookCreateDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Category = dto.Category,
                Quantity = dto.Quantity,
                AvailableQuantity = dto.Quantity,
                CreatedAt = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return MapToDto(book);
        }

        public async Task<BookResponseDto?> UpdateBookAsync(int id, BookUpdateDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return null;

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Category = dto.Category;
            book.Quantity = dto.Quantity;

            _context.Books.Update(book);
            await _context.SaveChangesAsync();
            return MapToDto(book);
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        private static BookResponseDto MapToDto(Book book)
        {
            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Category = book.Category,
                Quantity = book.Quantity,
                AvailableQuantity = book.AvailableQuantity,
                CreatedAt = book.CreatedAt
            };
        }
    }
}
