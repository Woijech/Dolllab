using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Services;
using Dollab_Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [ApiController]
    [Route("api/settings")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("theme")]
        public async Task<IActionResult> GetTheme()
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(new
            {
                theme = user.Theme
            });
        }

        [HttpPut("theme")]
        public async Task<IActionResult> UpdateTheme(UpdateThemeDto dto)
        {
            var currentUserId = User.GetUserId();

            if (dto.Theme != "light" && dto.Theme != "dark")
                return BadRequest("Тема должна быть light или dark");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            user.Theme = dto.Theme;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Тема успешно обновлена",
                theme = user.Theme
            });
        }
    }
}