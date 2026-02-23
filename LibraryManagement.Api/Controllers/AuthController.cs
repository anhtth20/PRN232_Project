using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Username and password are required" });

            var token = await _authService.LoginAsync(dto);
            if (token == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new { token });
        }
    }
}
