using LibraryManagement.Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LibraryManagement.Api.Services
{
    public interface IActivityLogService
    {
        Task LogActivityAsync(string action, string details, string memberName = null, string status = "Completed");
        Task<IEnumerable<ActivityLogDto>> GetRecentActivitiesAsync(int count = 10);
    }
}
