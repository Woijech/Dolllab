namespace Dollab_Backend.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int FromUserId { get; set; }
        public string FromUserName { get; set; }
        public string? FromUserAvatar { get; set; }

        public string Type { get; set; }
        public string Message { get; set; }

        public int? PostId { get; set; }
        public int? ReviewId { get; set; }

        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? FollowRequestId { get; set; }
    }
}
