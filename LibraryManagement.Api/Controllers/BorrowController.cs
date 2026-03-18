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
    public class BorrowController : BaseController
    {
        private readonly IBorrowService _borrowService;
        private readonly IActivityLogService _activityLogService;

        public BorrowController(IBorrowService borrowService, IActivityLogService activityLogService)
        {
            _borrowService = borrowService;
            _activityLogService = activityLogService;
        }

        [HttpPost]
        public async Task<ActionResult<BorrowResponseDto>> CreateBorrowRequest([FromBody] BorrowCreateDto dto)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            if (dto.DueDate <= DateTime.UtcNow)
                return BadRequest(new { message = "Due date must be in the future" });

            try
            {
                var borrow = await _borrowService.CreateBorrowRequestAsync(userId.Value, dto);
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
                await _activityLogService.LogActivityAsync("Requested Borrow", $"Book ID: {dto.BookId}", userName);

                return CreatedAtAction(nameof(GetMyBorrows), new { }, borrow);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my")]
        public async Task<ActionResult<object>> GetMyBorrows()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var borrows = await _borrowService.GetMyBorrowsAsync(userId.Value);
            return Ok(new { data = borrows });
        }

        [HttpGet("status/{bookId}")]
        public async Task<ActionResult<BookBorrowStatusDto>> GetBookBorrowStatus(int bookId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var status = await _borrowService.GetBookBorrowStatusAsync(userId.Value, bookId);
            return Ok(status);
        }

        [HttpGet]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<object>> GetAllBorrows()
        {
            var borrows = await _borrowService.GetAllBorrowsAsync();
            return Ok(new { data = borrows });
        }

        [HttpPut("{id}/approve")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<BorrowResponseDto>> ApproveBorrow(int id)
        {
            try
            {
                var borrow = await _borrowService.ApproveBorrowAsync(id);
                if (borrow == null)
                    return BadRequest(new { message = "Cannot approve this borrow request. Request not found." });

                var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
                await _activityLogService.LogActivityAsync("Approved Borrow", borrow.BookTitle ?? "Unknown Book", $"User {borrow.UserId}");

                return Ok(borrow);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/reject")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<BorrowResponseDto>> RejectBorrow(int id)
        {
            var borrow = await _borrowService.RejectBorrowAsync(id);
            if (borrow == null)
                return BadRequest(new { message = "Cannot reject this borrow request. Invalid status" });

            return Ok(borrow);
        }

        [HttpPut("{id}/return")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<BorrowResponseDto>> ReturnBorrow(int id)
        {
            try
            {
                var borrow = await _borrowService.ReturnBorrowAsync(id);
                if (borrow == null)
                    return BadRequest(new { message = "Cannot return this borrow request. Request not found." });

                var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
                await _activityLogService.LogActivityAsync("Returned Book", borrow.BookTitle ?? "Unknown Book", $"User {borrow.UserId}");

                return Ok(borrow);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/cancel")]
        public async Task<ActionResult<BorrowResponseDto>> CancelBorrow(int id)
        {
            var userId = GetUserId();
            bool isLibrarian = User.FindFirst("role")?.Value == "Librarian";

            var borrow = await _borrowService.CancelBorrowAsync(id, isLibrarian ? null : userId);
            if (borrow == null)
                return BadRequest(new { message = "Cannot cancel this borrow request. Invalid status or unauthorized" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            await _activityLogService.LogActivityAsync("Cancelled Borrow", borrow.BookTitle ?? "Unknown Book", $"User {borrow.UserId}");

            return Ok(borrow);
        }

        [HttpPut("{id}/revert")]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<BorrowResponseDto>> RevertBorrow(int id)
        {
            var borrow = await _borrowService.RevertBorrowAsync(id);
            if (borrow == null)
                return BadRequest(new { message = "Cannot revert this borrow request. Invalid status or no stock left to re-approve" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            await _activityLogService.LogActivityAsync("Reverted Borrow", borrow.BookTitle ?? "Unknown Book", $"User {borrow.UserId}");

            return Ok(borrow);
        }
        [HttpPut("{id}/renew")]
        public async Task<ActionResult<BorrowResponseDto>> RenewBorrow(int id)
        {
            try
            {
                var borrow = await _borrowService.RenewBorrowAsync(id);
                if (borrow == null)
                    return BadRequest(new { message = "Cannot renew this borrow request. Request not found." });

                var userName = User.FindFirstValue(ClaimTypes.Name) ?? "System";
                await _activityLogService.LogActivityAsync("Renewed Book", borrow.BookTitle ?? "Unknown Book", $"User {borrow.UserId}");

                return Ok(borrow);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
