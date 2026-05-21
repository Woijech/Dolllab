using Dollab_Backend.Data;
using Dollab_Backend.Services;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [ApiController]
    [Route("api/follow-requests")]
    [Authorize]
    public class FollowRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FollowRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{requestId}/accept")]
        public async Task<IActionResult> AcceptFollowRequest(int requestId)
        {
            var currentUserId = User.GetUserId();

            var request = await _context.FollowRequests
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId &&
                    r.TargetUserId == currentUserId &&
                    r.Status == "pending");

            if (request == null)
                return NotFound("Заявка не найдена");

            var alreadyFollowing = await _context.Follows
                .AnyAsync(f =>
                    f.FollowerId == request.RequesterId &&
                    f.FollowingId == request.TargetUserId);

            if (!alreadyFollowing)
            {
                var follow = new Follow
                {
                    FollowerId = request.RequesterId,
                    FollowingId = request.TargetUserId
                };

                _context.Follows.Add(follow);
            }

            request.Status = "accepted";

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.FollowRequestId == request.Id);

            if (notification != null)
            {
                notification.IsRead = true;
            }

            var acceptedNotification = new Notification
            {
                UserId = request.RequesterId,
                FromUserId = currentUserId,
                Type = NotificationType.Follow,
                Message = "принял вашу заявку на подписку",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(acceptedNotification);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Заявка принята"
            });
        }

        [HttpPost("{requestId}/reject")]
        public async Task<IActionResult> RejectFollowRequest(int requestId)
        {
            var currentUserId = User.GetUserId();

            var request = await _context.FollowRequests
                .FirstOrDefaultAsync(r =>
                    r.Id == requestId &&
                    r.TargetUserId == currentUserId &&
                    r.Status == "pending");

            if (request == null)
                return NotFound("Заявка не найдена");

            request.Status = "rejected";

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.FollowRequestId == request.Id);

            if (notification != null)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Заявка отклонена"
            });
        }
    }
}