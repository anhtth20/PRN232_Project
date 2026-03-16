using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Services
{
    public interface IBookService
    {
        Task<(IEnumerable<BookResponseDto> books, int total)> GetBooksAsync(string? search, int? categoryId = null, int pageNumber = 1, int pageSize = 10, string sortBy = "id");
        Task<BookResponseDto?> GetBookByIdAsync(int id);
        Task<BookResponseDto?> CreateBookAsync(BookCreateDto dto, string? imageUrl = null);
        Task<(BookResponseDto? Book, string? Error)> UpdateBookAsync(int id, BookUpdateDto dto, string? imageUrl = null);
        Task<bool> DeleteBookAsync(int id);
    }

    public class BookService : IBookService
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<BookResponseDto> books, int total)> GetBooksAsync(string? search, int? categoryId = null, int pageNumber = 1, int pageSize = 10, string sortBy = "id")
        {
            var query = _context.Books
                .Where(b => !b.IsDeleted)
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.Author.Name.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            var total = await query.CountAsync();

            query = sortBy.ToLower() switch
            {
                "title" => query.OrderBy(b => b.Title),
                "author" => query.OrderBy(b => b.Author.Name),
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
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id); // Allow fetching even if IsDeleted
            return book != null ? MapToDto(book) : null;
        }

        public async Task<BookResponseDto?> CreateBookAsync(BookCreateDto dto, string? imageUrl = null)
        {
            var book = new Book
            {
                Title = dto.Title,
                AuthorId = dto.AuthorId,
                CategoryId = dto.CategoryId,
                Quantity = dto.Quantity,
                AvailableQuantity = dto.Quantity,
                CreatedAt = DateTime.UtcNow,
                Description = dto.Description,
                ImageUrl = imageUrl,
                IsDeleted = false
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            await _context.Entry(book).Reference(b => b.Author).LoadAsync();
            await _context.Entry(book).Reference(b => b.Category).LoadAsync();

            return MapToDto(book);
        }

        public async Task<(BookResponseDto? Book, string? Error)> UpdateBookAsync(int id, BookUpdateDto dto, string? imageUrl = null)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
            if (book == null)
                return (null, "Book not found");

            try
            {
                book.Title = dto.Title;
                book.AuthorId = dto.AuthorId;
                book.CategoryId = dto.CategoryId;
                book.AdjustQuantity(dto.Quantity);
                book.Description = dto.Description;
                
                if (imageUrl != null)
                    book.ImageUrl = imageUrl;

                _context.Books.Update(book);
                await _context.SaveChangesAsync();

                await _context.Entry(book).Reference(b => b.Author).LoadAsync();
                await _context.Entry(book).Reference(b => b.Category).LoadAsync();

                return (MapToDto(book), null);
            }
            catch (InvalidOperationException ex)
            {
                return (null, ex.Message);
            }
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
            if (book == null) return false;

            // Check if there are active borrows for this book
            var activeBorrows = await _context.BorrowRequests.AnyAsync(br => br.BookId == id && br.Status == "Approved");
            if (activeBorrows)
            {
                throw new InvalidOperationException("Cannot delete book because there are still active borrows linked to it.");
            }

            book.IsDeleted = true;
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
            return true;
        }

        private static BookResponseDto MapToDto(Book book)
        {
            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                AuthorId = book.AuthorId,
                AuthorName = book.Author?.Name ?? "Unknown Author",
                CategoryId = book.CategoryId,
                CategoryName = book.Category?.Name ?? "General",
                Quantity = book.Quantity,
                AvailableQuantity = book.AvailableQuantity,
                Description = book.Description,
                CreatedAt = book.CreatedAt,
                ImageUrl = book.ImageUrl,
                IsDeleted = book.IsDeleted
            };
        }
    }
}
