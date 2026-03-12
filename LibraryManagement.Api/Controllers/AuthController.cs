using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : BaseController
    {
        private readonly IAuthService _authService;
        private readonly IActivityLogService _activityLogService;

        public AuthController(IAuthService authService, IActivityLogService activityLogService)
        {
            _authService = authService;
            _activityLogService = activityLogService;
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

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] UserRegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Username and password are required" });

            var user = await _authService.RegisterAsync(dto.Username, dto.Password, dto.FullName, dto.Email, dto.Role);
            if (user == null)
                return BadRequest(new { message = "Username already exists or registration failed" });

            await _activityLogService.LogActivityAsync("Registered Member", dto.Email, dto.FullName);

            return Ok(new { message = "User registered successfully" });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<ActionResult<UserResponseDto>> GetProfile()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var user = await _authService.GetByIdAsync(userId.Value);
            if (user == null) return NotFound();

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile([FromBody] UserUpdateDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var success = await _authService.UpdateAsync(userId.Value, dto);
                if (!success) return NotFound();

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
