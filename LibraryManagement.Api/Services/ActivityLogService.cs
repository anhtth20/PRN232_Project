using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LibraryManagement.Api.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogActivityAsync(string action, string details, string memberName = null, string status = "Completed")
        {
            var log = new ActivityLog
            {
                Action = action,
                Details = details,
                MemberName = memberName,
                Status = status,
                Timestamp = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ActivityLogDto>> GetRecentActivitiesAsync(int count = 10)
        {
            var logs = await _context.ActivityLogs
                .OrderByDescending(al => al.Timestamp)
                .Take(count)
                .Select(al => new ActivityLogDto
                {
                    Id = al.Id,
                    Action = al.Action,
                    Details = al.Details,
                    MemberName = al.MemberName,
                    Timestamp = al.Timestamp,
                    Status = al.Status
                })
                .ToListAsync();

            return logs;
        }
    }
}
