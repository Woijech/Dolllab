using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Security.Cryptography;
using System.Text;

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

        [HttpGet("profile-privacy")]
        public async Task<IActionResult> GetProfilePrivacy()
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(new
            {
                profileVisibility = user.ProfileVisibility
            });
        }

        [HttpPut("profile-privacy")]
        public async Task<IActionResult> UpdateProfilePrivacy(UpdateProfilePrivacyDto dto)
        {
            var currentUserId = User.GetUserId();

            if (dto.ProfileVisibility != "public" && dto.ProfileVisibility != "followers")
                return BadRequest("Значение должно быть public или followers");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            user.ProfileVisibility = dto.ProfileVisibility;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Настройки приватности обновлены",
                profileVisibility = user.ProfileVisibility
            });
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotificationSettings()
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(new
            {
                notifyLikes = user.NotifyLikes,
                notifyFollowers = user.NotifyFollowers,
                notifyComments = user.NotifyComments,
                notifyReviews = user.NotifyReviews
            });
        }

        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotificationSettings(UpdateNotificationSettingsDto dto)
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            user.NotifyLikes = dto.NotifyLikes;
            user.NotifyFollowers = dto.NotifyFollowers;
            user.NotifyComments = dto.NotifyComments;
            user.NotifyReviews = dto.NotifyReviews;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Настройки уведомлений обновлены"
            });
        }
        [HttpGet("store")]
        public async Task<IActionResult> GetStoreSettings()
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            return Ok(new
            {
                showStoreInProfile = user.ShowStoreInProfile,
                allowReviews = user.AllowReviews,
                showRatingInProfile = user.ShowRatingInProfile
            });
        }
        [HttpPut("store")]
        public async Task<IActionResult> UpdateStoreSettings(UpdateStoreSettingsDto dto)
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            user.ShowStoreInProfile = dto.ShowStoreInProfile;
            user.AllowReviews = dto.AllowReviews;
            user.ShowRatingInProfile = dto.ShowRatingInProfile;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Настройки магазина обновлены"
            });
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            var oldPasswordHash = HashPassword(dto.OldPassword);

            if (user.PasswordHash != oldPasswordHash)
                return BadRequest("Старый пароль введен неверно");

            user.PasswordHash = HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Пароль успешно изменен"
            });
        }
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var currentUserId = User.GetUserId();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == currentUserId);

            if (user == null)
                return NotFound("Пользователь не найден");

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Аккаунт удален"
            });
        }
    }
}