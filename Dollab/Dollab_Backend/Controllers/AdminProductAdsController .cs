using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/product-ads")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminProductAdsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminProductAdsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProductAds()
        {
            var ads = await _context.ProductAds
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Price,
                    p.CreatedAt,
                    p.IsHidden,
                    p.HiddenReason,
                    p.HiddenAt,

                    User = new
                    {
                        p.User.Id,
                        p.User.Username
                    },

                    Category = new
                    {
                        p.Category.Id,
                        p.Category.Name
                    },

                    Images = p.Images.Select(i => new
                    {
                        i.Id,
                        i.ImageUrl
                    })
                })
                .ToListAsync();

            return Ok(ads);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductAd(int id)
        {
            var ad = await _context.ProductAds
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Price,
                    p.CreatedAt,

                    p.IsHidden,
                    p.HiddenReason,
                    p.HiddenAt,

                    User = new
                    {
                        p.User.Id,
                        p.User.Username,
                        AvatarUrl = p.User.AvatarUrl ?? ""
                    },

                    Category = new
                    {
                        p.Category.Id,
                        p.Category.Name
                    },

                    Images = p.Images.Select(i => new
                    {
                        i.Id,
                        i.ImageUrl
                    }).ToList(),

                    ReportsCount = _context.Reports.Count(r => r.ReportedProductAdId == p.Id)
                })
                .FirstOrDefaultAsync();

            if (ad == null)
                return NotFound("Объявление не найдено");

            return Ok(ad);
        }

        [HttpPost("{id}/hide")]
        public async Task<IActionResult> HideProductAd(int id, AdminProductAdActionDto dto)
        {
            var ad = await _context.ProductAds
                .FirstOrDefaultAsync(p => p.Id == id);

            if (ad == null)
                return NotFound("Объявление не найдено");

            ad.IsHidden = true;
            ad.HiddenReason = dto.Reason;
            ad.HiddenAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Объявление скрыто");
        }

        [HttpPost("{id}/unhide")]
        public async Task<IActionResult> UnhideProductAd(int id)
        {
            var ad = await _context.ProductAds
                .FirstOrDefaultAsync(p => p.Id == id);

            if (ad == null)
                return NotFound("Объявление не найдено");

            ad.IsHidden = false;
            ad.HiddenReason = null;
            ad.HiddenAt = null;

            await _context.SaveChangesAsync();

            return Ok("Объявление снова отображается");
        }
    }
}