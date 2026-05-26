using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role != "Admin")
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsBanned,
                    u.BanReason,
                    u.BlockedUntil,
                    u.BlockReason,
                    u.AvatarUrl,
                    u.CreatedAt
                })
                .OrderByDescending(u => u.Id)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsBanned,
                    u.BanReason,
                    u.BlockedUntil,
                    u.BlockReason,
                    u.AvatarUrl,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(user);
        }

        [HttpPost("{id}/ban")]
        public async Task<IActionResult> BanUser(int id, AdminUserActionDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("Пользователь не найден");

            if (user.Role == "Admin")
                return BadRequest("Нельзя забанить администратора");

            user.IsBanned = true;
            user.BanReason = dto.Reason;

            user.BlockedUntil = null;
            user.BlockReason = null;

            await _context.SaveChangesAsync();

            return Ok("Пользователь забанен");
        }

        [HttpPost("{id}/block")]
        public async Task<IActionResult> BlockUser(int id, AdminUserActionDto dto)
        {
            if (dto.BlockedUntil == null)
                return BadRequest("Нужно указать дату окончания блокировки");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("Пользователь не найден");

            if (user.Role == "Admin")
                return BadRequest("Нельзя заблокировать администратора");

            user.IsBanned = false;
            user.BanReason = null;

            user.BlockedUntil = dto.BlockedUntil;
            user.BlockReason = dto.Reason;

            await _context.SaveChangesAsync();

            return Ok("Пользователь временно заблокирован");
        }

        [HttpPost("{id}/unblock")]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("Пользователь не найден");

            user.IsBanned = false;
            user.BanReason = null;

            user.BlockedUntil = null;
            user.BlockReason = null;

            await _context.SaveChangesAsync();

            return Ok("Пользователь разблокирован");
        }
    }
}