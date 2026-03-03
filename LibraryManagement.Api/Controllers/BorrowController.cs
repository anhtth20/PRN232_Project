using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BorrowController : BaseController
    {
        private readonly IBorrowService _borrowService;

        public BorrowController(IBorrowService borrowService)
        {
            _borrowService = borrowService;
        }

        [HttpPost]
        public async Task<ActionResult<BorrowResponseDto>> CreateBorrowRequest([FromBody] BorrowCreateDto dto)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            if (dto.DueDate <= DateTime.UtcNow)
                return BadRequest(new { message = "Due date must be in the future" });

            var borrow = await _borrowService.CreateBorrowRequestAsync(userId.Value, dto);
            if (borrow == null)
                return BadRequest(new { message = "Cannot create borrow request. Book not available or you already have 3 approved books" });

            return CreatedAtAction(nameof(GetMyBorrows), new { }, borrow);
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
            var borrow = await _borrowService.ApproveBorrowAsync(id);
            if (borrow == null)
                return BadRequest(new { message = "Cannot approve this borrow request. Invalid status or book not available" });

            return Ok(borrow);
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
            var borrow = await _borrowService.ReturnBorrowAsync(id);
            if (borrow == null)
                return BadRequest(new { message = "Cannot return this borrow request. Invalid status" });

            return Ok(borrow);
        }
    }
}
