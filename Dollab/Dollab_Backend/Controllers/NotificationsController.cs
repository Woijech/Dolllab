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
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var currentUserId = User.GetUserId();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId)
                .Include(n => n.FromUser)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    FromUserId = n.FromUserId,
                    FromUserName = n.FromUser.Username,
                    FromUserAvatar = n.FromUser.AvatarUrl,
                    Type = n.Type.ToString(),
                    Message = n.Message,
                    PostId = n.PostId,
                    ReviewId = n.ReviewId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var currentUserId = User.GetUserId();

            var count = await _context.Notifications
                .CountAsync(n => n.UserId == currentUserId && !n.IsRead);

            return Ok(new { count });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = User.GetUserId();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == currentUserId);

            if (notification == null)
                return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var currentUserId = User.GetUserId();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
                notification.IsRead = true;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var currentUserId = User.GetUserId();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == currentUserId);

            if (notification == null)
                return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}