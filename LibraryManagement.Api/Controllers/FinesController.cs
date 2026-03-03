using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinesController : BaseController
    {
        private readonly IFineService _fineService;

        public FinesController(IFineService fineService)
        {
            _fineService = fineService;
        }

        [HttpGet("my")]
        public async Task<ActionResult<object>> GetMyFines()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var fines = await _fineService.GetMyFinesAsync(userId.Value);
            return Ok(new { data = fines });
        }

        [HttpGet]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<object>> GetAllFines()
        {
            var fines = await _fineService.GetAllFinesAsync();
            return Ok(new { data = fines });
        }

        [HttpGet("borrow/{borrowId}")]
        public async Task<ActionResult<FineResponseDto>> GetFineByBorrowId(int borrowId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var fine = await _fineService.GetFineByBorrowIdAsync(borrowId);
            if (fine == null)
                return NotFound(new { message = "No fine found for this borrow request" });

            return Ok(fine);
        }
    }
}
