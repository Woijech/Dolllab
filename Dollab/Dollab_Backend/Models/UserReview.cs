namespace Dollab_Backend.Models
{
    public class UserReview
    {
        public int Id { get; set; }

        public int ReviewerId { get; set; }
        public User Reviewer { get; set; } = null!;

        public int ReviewedUserId { get; set; }
        public User ReviewedUser { get; set; } = null!;

        public int Rating { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
