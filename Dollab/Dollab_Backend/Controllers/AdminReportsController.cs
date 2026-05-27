using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/reports")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetReports([FromQuery] ReportStatus? status)
        {
            var query = _context.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.ReportedPost)
                    .ThenInclude(p => p.User)
                .Include(r => r.ReportedProductAd)
                    .ThenInclude(a => a.User)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var reports = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Reason,
                    r.Description,
                    r.Status,
                    r.CreatedAt,
                    r.AdminComment,
                    r.ReviewedAt,

                    Reporter = new
                    {
                        r.Reporter.Id,
                        r.Reporter.Username,
                        AvatarUrl = r.Reporter.AvatarUrl ?? ""
                    },

                    ReportedUser = r.ReportedUser == null ? null : new
                    {
                        r.ReportedUser.Id,
                        r.ReportedUser.Username,
                        AvatarUrl = r.ReportedUser.AvatarUrl ?? ""
                    },

                    ReportedPost = r.ReportedPost == null ? null : new
                    {
                        r.ReportedPost.Id,
                        r.ReportedPost.Description,
                        r.ReportedPost.ImageUrl,
                        r.ReportedPost.IsHidden,
                        Author = new
                        {
                            r.ReportedPost.User.Id,
                            r.ReportedPost.User.Username
                        }
                    },

                    ReportedProductAd = r.ReportedProductAd == null ? null : new
                    {
                        r.ReportedProductAd.Id,
                        r.ReportedProductAd.Title,
                        r.ReportedProductAd.Price,
                        r.ReportedProductAd.IsHidden,
                        Author = new
                        {
                            r.ReportedProductAd.User.Id,
                            r.ReportedProductAd.User.Username
                        }
                    }
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            var report = await _context.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.ReportedPost)
                    .ThenInclude(p => p.User)
                .Include(r => r.ReportedProductAd)
                    .ThenInclude(a => a.User)
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Reason,
                    r.Description,
                    r.Status,
                    r.CreatedAt,
                    r.AdminComment,
                    r.ReviewedAt,

                    Reporter = new
                    {
                        r.Reporter.Id,
                        r.Reporter.Username,
                        AvatarUrl = r.Reporter.AvatarUrl ?? ""
                    },

                    ReportedUser = r.ReportedUser == null ? null : new
                    {
                        r.ReportedUser.Id,
                        r.ReportedUser.Username,
                        AvatarUrl = r.ReportedUser.AvatarUrl ?? ""
                    },

                    ReportedPost = r.ReportedPost == null ? null : new
                    {
                        r.ReportedPost.Id,
                        r.ReportedPost.Description,
                        r.ReportedPost.ImageUrl,
                        r.ReportedPost.IsHidden,
                        Author = new
                        {
                            r.ReportedPost.User.Id,
                            r.ReportedPost.User.Username
                        }
                    },

                    ReportedProductAd = r.ReportedProductAd == null ? null : new
                    {
                        r.ReportedProductAd.Id,
                        r.ReportedProductAd.Title,
                        r.ReportedProductAd.Price,
                        r.ReportedProductAd.IsHidden,
                        Author = new
                        {
                            r.ReportedProductAd.User.Id,
                            r.ReportedProductAd.User.Username
                        }
                    }
                })
                .FirstOrDefaultAsync();

            if (report == null)
                return NotFound("Жалоба не найдена");

            return Ok(report);
        }

        [HttpPost("{id}/review")]
        public async Task<IActionResult> ReviewReport(int id, AdminReportDecisionDto dto)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return NotFound("Жалоба не найдена");

            report.Status = ReportStatus.Reviewed;
            report.AdminComment = dto.AdminComment;
            report.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Жалоба отмечена как рассмотренная");
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectReport(int id, AdminReportDecisionDto dto)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return NotFound("Жалоба не найдена");

            report.Status = ReportStatus.Rejected;
            report.AdminComment = dto.AdminComment;
            report.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Жалоба отклонена");
        }
    }
}