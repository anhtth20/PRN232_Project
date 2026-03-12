using LibraryManagement.Api.Data;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LibraryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "LibrarianOnly")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _activityLogService;

        public DashboardController(ApplicationDbContext context, IActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalBooks = await _context.Books.SumAsync(b => b.Quantity);
            var activeBorrows = await _context.BorrowRequests.CountAsync(br => br.Status == "Approved");
            var overdueBooks = await _context.BorrowRequests.CountAsync(br => br.Status == "Approved" && br.DueDate < DateTime.UtcNow);
            var pendingFinesSum = await _context.Fines.Where(f => f.Status == "Pending").SumAsync(f => (decimal?)f.Amount) ?? 0;

            // Generate borrowing trends for the last 7 days
            var rawTrends = await _context.BorrowRequests
                .Where(br => br.RequestDate >= DateTime.UtcNow.AddDays(-6))
                .GroupBy(br => br.RequestDate.Date)
                .Select(g => new { Date = g.Key, Borrows = g.Count(), Returns = g.Count(x => x.Status == "Returned") })
                .ToListAsync();

            var trends = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var targetDate = DateTime.UtcNow.AddDays(-i).Date;
                var trend = rawTrends.FirstOrDefault(t => t.Date == targetDate);
                trends.Add(new
                {
                    name = targetDate.ToString("ddd"), // e.g., "Mon", "Tue"
                    borrows = trend?.Borrows ?? 0,
                    returns = trend?.Returns ?? 0
                });
            }

            var recentActivities = await _activityLogService.GetRecentActivitiesAsync(5);

            return Ok(new
            {
                TotalBooks = totalBooks,
                ActiveBorrows = activeBorrows,
                OverdueBooks = overdueBooks,
                PendingFines = pendingFinesSum,
                Trends = trends,
                RecentActivity = recentActivities
            });
        }
    }
}
