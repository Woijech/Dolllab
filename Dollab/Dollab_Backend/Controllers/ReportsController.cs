using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/reports")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyReports()
        {
            var currentUserId = User.GetUserId();

            var reports = await _context.Reports
                .Include(r => r.ReportedUser)
                .Include(r => r.ReportedPost)
                .Include(r => r.ReportedProductAd)
                .Where(r => r.ReporterId == currentUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Reason,
                    r.Description,
                    r.Status,
                    r.CreatedAt,

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
                        r.ReportedPost.ImageUrl
                    },

                    ReportedProductAd = r.ReportedProductAd == null ? null : new
                    {
                        r.ReportedProductAd.Id,
                        r.ReportedProductAd.Title,
                        r.ReportedProductAd.Price
                    }
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPost("posts/{postId}")]
        [Authorize]
        public async Task<IActionResult> ReportPost(int postId, CreateUserReportDto dto)
        {
            var currentUserId = User.GetUserId();

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Укажите причину жалобы");

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                return NotFound("Пост не найден");

            if (post.UserId == currentUserId)
                return BadRequest("Нельзя пожаловаться на свой пост");

            var alreadyReported = await _context.Reports
                .AnyAsync(r =>
                    r.ReporterId == currentUserId &&
                    r.ReportedPostId == postId &&
                    r.Status == ReportStatus.Pending);

            if (alreadyReported)
                return BadRequest("Вы уже отправили жалобу на этот пост");

            var report = new Report
            {
                ReporterId = currentUserId,
                ReportedPostId = postId,
                Type = ReportType.Post,
                Reason = dto.Reason.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description)
                    ? null
                    : dto.Description.Trim(),
                Status = ReportStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Жалоба на пост отправлена" });
        }

        [HttpPost("product-ads/{productAdId}")]
        [Authorize]
        public async Task<IActionResult> ReportProductAd(int productAdId, CreateUserReportDto dto)
        {
            var currentUserId = User.GetUserId();

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Укажите причину жалобы");

            var productAd = await _context.ProductAds
                .FirstOrDefaultAsync(p => p.Id == productAdId);

            if (productAd == null)
                return NotFound("Объявление не найдено");

            if (productAd.UserId == currentUserId)
                return BadRequest("Нельзя пожаловаться на свое объявление");

            var alreadyReported = await _context.Reports
                .AnyAsync(r =>
                    r.ReporterId == currentUserId &&
                    r.ReportedProductAdId == productAdId &&
                    r.Status == ReportStatus.Pending);

            if (alreadyReported)
                return BadRequest("Вы уже отправили жалобу на это объявление");

            var report = new Report
            {
                ReporterId = currentUserId,
                ReportedProductAdId = productAdId,
                Type = ReportType.ProductAd,
                Reason = dto.Reason.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description)
                    ? null
                    : dto.Description.Trim(),
                Status = ReportStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Жалоба на объявление отправлена" });
        }
    }
}