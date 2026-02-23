using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Services
{
    public interface IBorrowService
    {
        Task<BorrowResponseDto?> CreateBorrowRequestAsync(int userId, BorrowCreateDto dto);
        Task<IEnumerable<BorrowResponseDto>> GetMyBorrowsAsync(int userId);
        Task<IEnumerable<BorrowResponseDto>> GetAllBorrowsAsync();
        Task<BorrowResponseDto?> ApproveBorrowAsync(int borrowId);
        Task<BorrowResponseDto?> RejectBorrowAsync(int borrowId);
        Task<BorrowResponseDto?> ReturnBorrowAsync(int borrowId);
    }

    public class BorrowService : IBorrowService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFineService _fineService;

        public BorrowService(ApplicationDbContext context, IFineService fineService)
        {
            _context = context;
            _fineService = fineService;
        }

        public async Task<BorrowResponseDto?> CreateBorrowRequestAsync(int userId, BorrowCreateDto dto)
        {
            // Check if book exists and has available quantity
            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null || book.AvailableQuantity == 0)
                return null;

            // Check if borrower already has 3 approved books
            var approvedCount = await _context.BorrowRequests
                .Where(br => br.UserId == userId && br.Status == "Approved")
                .CountAsync();

            if (approvedCount >= 3)
                return null;

            var borrow = new BorrowRequest
            {
                UserId = userId,
                BookId = dto.BookId,
                RequestDate = DateTime.UtcNow,
                DueDate = dto.DueDate,
                Status = "Pending"
            };

            _context.BorrowRequests.Add(borrow);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(borrow);
        }

        public async Task<IEnumerable<BorrowResponseDto>> GetMyBorrowsAsync(int userId)
        {
            var borrows = await _context.BorrowRequests
                .Where(br => br.UserId == userId)
                .Include(br => br.Book)
                .ToListAsync();

            return borrows.Select(b => MapToDto(b)).ToList();
        }

        public async Task<IEnumerable<BorrowResponseDto>> GetAllBorrowsAsync()
        {
            var borrows = await _context.BorrowRequests
                .Include(br => br.Book)
                .ToListAsync();

            return borrows.Select(b => MapToDto(b)).ToList();
        }

        public async Task<BorrowResponseDto?> ApproveBorrowAsync(int borrowId)
        {
            var borrow = await _context.BorrowRequests.FindAsync(borrowId);
            if (borrow == null || borrow.Status != "Pending")
                return null;

            var book = await _context.Books.FindAsync(borrow.BookId);
            if (book == null || book.AvailableQuantity == 0)
                return null;

            borrow.Status = "Approved";
            book.AvailableQuantity--;

            _context.BorrowRequests.Update(borrow);
            _context.Books.Update(book);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(borrow);
        }

        public async Task<BorrowResponseDto?> RejectBorrowAsync(int borrowId)
        {
            var borrow = await _context.BorrowRequests.FindAsync(borrowId);
            if (borrow == null || borrow.Status != "Pending")
                return null;

            borrow.Status = "Rejected";
            _context.BorrowRequests.Update(borrow);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(borrow);
        }

        public async Task<BorrowResponseDto?> ReturnBorrowAsync(int borrowId)
        {
            var borrow = await _context.BorrowRequests
                .Include(br => br.Book)
                .FirstOrDefaultAsync(br => br.Id == borrowId);

            if (borrow == null || borrow.Status != "Approved")
                return null;

            borrow.Status = "Returned";
            borrow.Book!.AvailableQuantity++;

            _context.BorrowRequests.Update(borrow);
            _context.Books.Update(borrow.Book);

            // Check if overdue and create fine
            if (DateTime.UtcNow > borrow.DueDate)
            {
                var daysLate = (int)(DateTime.UtcNow - borrow.DueDate).TotalDays;
                var fineAmount = daysLate * 5000m;
                await _fineService.CreateFineAsync(borrowId, fineAmount);
            }

            await _context.SaveChangesAsync();

            return await MapToDtoAsync(borrow);
        }

        private BorrowResponseDto MapToDto(BorrowRequest borrow)
        {
            return new BorrowResponseDto
            {
                Id = borrow.Id,
                UserId = borrow.UserId,
                BookId = borrow.BookId,
                BookTitle = borrow.Book?.Title,
                RequestDate = borrow.RequestDate,
                DueDate = borrow.DueDate,
                Status = borrow.Status
            };
        }

        private async Task<BorrowResponseDto?> MapToDtoAsync(BorrowRequest borrow)
        {
            var book = await _context.Books.FindAsync(borrow.BookId);
            return new BorrowResponseDto
            {
                Id = borrow.Id,
                UserId = borrow.UserId,
                BookId = borrow.BookId,
                BookTitle = book?.Title,
                RequestDate = borrow.RequestDate,
                DueDate = borrow.DueDate,
                Status = borrow.Status
            };
        }
    }
}
