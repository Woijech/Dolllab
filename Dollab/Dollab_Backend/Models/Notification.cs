namespace Dollab_Backend.Models
{
    public enum NotificationType
    {
        Follow = 1,
        Like = 2,
        Comment = 3,
        Review = 4,
        NewPost = 5,
        FollowRequest = 6
    }

    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; }          // кому пришло уведомление
        public User User { get; set; }

        public int FromUserId { get; set; }      // кто сделал действие
        public User FromUser { get; set; }

        public NotificationType Type { get; set; }

        public int? PostId { get; set; }
        public Post? Post { get; set; }

        public int? ReviewId { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? FollowRequestId { get; set; }
    }
}