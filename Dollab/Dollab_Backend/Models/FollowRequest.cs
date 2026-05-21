namespace Dollab_Backend.Models
{
    public class FollowRequest
    {
        public int Id { get; set; }

        public int RequesterId { get; set; }
        public User Requester { get; set; }

        public int TargetUserId { get; set; }
        public User TargetUser { get; set; }

        public string Status { get; set; } = "pending";
        // pending, accepted, rejected

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
