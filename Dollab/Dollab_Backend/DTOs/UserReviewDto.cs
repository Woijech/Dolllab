namespace Dollab_Backend.DTOs
{
    public class UserReviewDto
    {
        public int Id { get; set; }

        public int ReviewerId { get; set; }

        public string ReviewerUsername { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
