using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/user-requests")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUserRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUserRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRequests([FromQuery] UserRequestStatus? status)
        {
            var query = _context.UserRequests
                .Include(r => r.User)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var requests = await query
                .OrderByDescending(r => r.CreatedAt)
                .Include(r => r.Images)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    Images = r.Images.Select(i => i.ImageUrl).ToList(),
                    r.Description,
                    r.Status,
                    r.AdminComment,
                    r.CreatedAt,
                    r.ReviewedAt,

                    User = new
                    {
                        r.User.Id,
                        r.User.Username,
                        AvatarUrl = r.User.AvatarUrl ?? ""
                    }
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequest(int id)
        {
            var request = await _context.UserRequests
                .Include(r => r.User)
                .Where(r => r.Id == id)
                .Include(r => r.Images)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    Images = r.Images.Select(i => i.ImageUrl).ToList(),
                    r.Description,
                    r.Status,
                    r.AdminComment,
                    r.CreatedAt,
                    r.ReviewedAt,

                    User = new
                    {
                        r.User.Id,
                        r.User.Username,
                        AvatarUrl = r.User.AvatarUrl ?? ""
                    }
                })
                .FirstOrDefaultAsync();

            if (request == null)
                return NotFound("Заявка не найдена");

            return Ok(request);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateRequestStatus(int id, AdminUpdateUserRequestDto dto)
        {
            var request = await _context.UserRequests
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
                return NotFound("Заявка не найдена");

            request.Status = dto.Status;
            request.AdminComment = dto.AdminComment;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Статус заявки обновлен");
        }
    }
}