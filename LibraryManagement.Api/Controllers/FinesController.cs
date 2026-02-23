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
    public class FinesController : ControllerBase
    {
        private readonly IFineService _fineService;

        public FinesController(IFineService fineService)
        {
            _fineService = fineService;
        }

        [HttpGet("my")]
        public async Task<ActionResult<object>> GetMyFines()
        {
            var userIdClaim = User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "User not authenticated" });

            var fines = await _fineService.GetMyFinesAsync(userId);
            return Ok(new { data = fines });
        }

        [HttpGet]
        [Authorize(Policy = "LibrarianOnly")]
        public async Task<ActionResult<object>> GetAllFines()
        {
            var fines = await _fineService.GetAllFinesAsync();
            return Ok(new { data = fines });
        }
    }
}
