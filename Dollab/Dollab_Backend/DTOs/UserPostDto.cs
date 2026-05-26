namespace Dollab_Backend.DTOs
{
    public class UserPostDto
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; } = "";

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public int LikesCount { get; set; }
        public bool IsLiked { get; set; }
        public bool IsFavorited { get; set; }
        public bool IsHidden { get; set; }
        public string? HiddenReason { get; set; }

    }
}
