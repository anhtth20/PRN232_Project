using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.Api.Controllers
{
    /// <summary>
    /// Shared base for all API controllers.
    /// Provides common helpers such as JWT claim extraction.
    /// </summary>
    [ApiController]
    public class BaseController : ControllerBase
    {
        /// <summary>
        /// Reads the authenticated user's ID from the JWT sub claim.
        /// Returns null if the token is absent or the claim cannot be parsed.
        /// </summary>
        protected int? GetUserId()
        {
            // After clearing DefaultInboundClaimTypeMap, the claim is literally "sub"
            var claim = User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out var id))
                return id;
            return null;
        }
    }
}
