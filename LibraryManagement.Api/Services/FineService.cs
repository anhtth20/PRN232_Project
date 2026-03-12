using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Services
{
    public interface IFineService
    {
        Task<FineResponseDto?> CreateFineAsync(int borrowRequestId, decimal amount);
        Task<IEnumerable<FineResponseDto>> GetMyFinesAsync(int userId);
        Task<IEnumerable<FineResponseDto>> GetAllFinesAsync();
        Task<FineResponseDto?> GetFineByBorrowIdAsync(int borrowId);
    }

    public class FineService : IFineService
    {
        private readonly ApplicationDbContext _context;

        public FineService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FineResponseDto?> CreateFineAsync(int borrowRequestId, decimal amount)
        {
            var borrow = await _context.BorrowRequests.FindAsync(borrowRequestId);
            if (borrow == null)
                return null;

            var fine = new Fine
            {
                BorrowRequestId = borrowRequestId,
                Amount = amount,
                CreatedAt = DateTime.UtcNow
            };

            _context.Fines.Add(fine);
            await _context.SaveChangesAsync();

            return MapToDto(fine);
        }

        public async Task<IEnumerable<FineResponseDto>> GetMyFinesAsync(int userId)
        {
            var fines = await _context.Fines
                .Include(f => f.BorrowRequest)
                .ThenInclude(br => br!.Book)
                .ThenInclude(b => b!.Author)
                .Where(f => f.BorrowRequest!.UserId == userId)
                .ToListAsync();

            return fines.Select(f => MapToDto(f)).ToList();
        }

        public async Task<IEnumerable<FineResponseDto>> GetAllFinesAsync()
        {
            var fines = await _context.Fines
                .Include(f => f.BorrowRequest)
                .ThenInclude(br => br!.Book)
                .ThenInclude(b => b!.Author)
                .ToListAsync();
            return fines.Select(f => MapToDto(f)).ToList();
        }

        public async Task<FineResponseDto?> GetFineByBorrowIdAsync(int borrowId)
        {
            var fine = await _context.Fines
                .Include(f => f.BorrowRequest)
                .ThenInclude(br => br!.Book)
                .ThenInclude(b => b!.Author)
                .Where(f => f.BorrowRequestId == borrowId)
                .FirstOrDefaultAsync();
            return fine == null ? null : MapToDto(fine);
        }

        private static FineResponseDto MapToDto(Fine fine)
        {
            return new FineResponseDto
            {
                Id = fine.Id,
                BorrowRequestId = fine.BorrowRequestId,
                Amount = fine.Amount,
                CreatedAt = fine.CreatedAt,
                Status = fine.Status,
                BookId = fine.BorrowRequest?.BookId,
                BookTitle = fine.BorrowRequest?.Book?.Title,
                AuthorName = fine.BorrowRequest?.Book?.Author?.Name
            };
        }
    }
}
