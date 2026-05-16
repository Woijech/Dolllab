using Dollab_Backend.Auth;
using System.ComponentModel.DataAnnotations;

namespace Dollab_Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = Roles.User;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public List<Post> Posts { get; set; } = new();
        public List<Like> Likes { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();
        public List<Follow> Followers { get; set; } = new();
        public List<Follow> Following { get; set; } = new();
        public List<Favorite> Favorites { get; set; } = new();
        public List<ProductAd> ProductAds { get; set; } = new();
        public List<CartItem> CartItems { get; set; } = new();
        public List<UserReview> ReviewsWritten { get; set; } = new();
        public List<UserReview> ReviewsReceived { get; set; } = new();
        public string Theme { get; set; } = "light";

    }

}
