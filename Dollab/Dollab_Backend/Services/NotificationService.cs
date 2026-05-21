using Dollab_Backend.Data;
using Dollab_Backend.Models;

namespace Dollab_Backend.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateNotificationAsync(
            int userId,
            int fromUserId,
            NotificationType type,
            string message,
            int? postId = null,
            int? reviewId = null,
            int? followRequestId = null)
        {
            if (userId == fromUserId)
                return;

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return;

            if (type == NotificationType.Like && !user.NotifyLikes)
                return;

            if (type == NotificationType.Follow && !user.NotifyFollowers)
                return;

            if (type == NotificationType.Comment && !user.NotifyComments)
                return;

            if (type == NotificationType.Review && !user.NotifyReviews)
                return;

            var notification = new Notification
            {
                UserId = userId,
                FromUserId = fromUserId,
                Type = type,
                Message = message,
                PostId = postId,
                ReviewId = reviewId,
                FollowRequestId = followRequestId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}