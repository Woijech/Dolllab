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
            int? reviewId = null)
        {
            if (userId == fromUserId)
                return;

            var notification = new Notification
            {
                UserId = userId,
                FromUserId = fromUserId,
                Type = type,
                Message = message,
                PostId = postId,
                ReviewId = reviewId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}