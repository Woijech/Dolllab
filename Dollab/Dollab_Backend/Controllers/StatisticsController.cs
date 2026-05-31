using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Dollab_Backend.Data;

namespace Dollab_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StatisticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("activity")]
        public async Task<IActionResult> GetActivityStatistics()
        {
            var users = await _context.Users
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var posts = await _context.Posts
                .GroupBy(p => p.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var ads = await _context.ProductAds
                .GroupBy(a => a.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var allDates = users.Select(x => x.Date)
                .Union(posts.Select(x => x.Date))
                .Union(ads.Select(x => x.Date))
                .OrderBy(x => x)
                .ToList();

            var result = allDates.Select(date => new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Users = users.FirstOrDefault(x => x.Date == date)?.Count ?? 0,
                Posts = posts.FirstOrDefault(x => x.Date == date)?.Count ?? 0,
                Ads = ads.FirstOrDefault(x => x.Date == date)?.Count ?? 0
            });

            return Ok(result);
        }
    }
}