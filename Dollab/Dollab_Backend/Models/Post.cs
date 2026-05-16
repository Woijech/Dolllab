namespace Dollab_Backend.Models
{
    public class Post
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public List<Like> Likes { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();
        public List<Favorite> Favorites { get; set; } = new();
    }
}
