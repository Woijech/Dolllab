namespace Dollab_Backend.DTOs
{
    public class UpdateNotificationSettingsDto
    {
        public bool NotifyLikes { get; set; }
        public bool NotifyFollowers { get; set; }
        public bool NotifyComments { get; set; }
        public bool NotifyReviews { get; set; }
        public bool NotifyCommentLikes { get; set; }
        public bool NotifyCommentReplies { get; set; }
    }
}
