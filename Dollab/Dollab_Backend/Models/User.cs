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
        public string ProfileVisibility { get; set; } = "public";
        public bool NotifyLikes { get; set; } = true;
        public bool NotifyFollowers { get; set; } = true;
        public bool NotifyComments { get; set; } = true;
        public bool NotifyReviews { get; set; } = true;
        public bool ShowStoreInProfile { get; set; } = true;
        public bool AllowReviews { get; set; } = true;
        public bool ShowRatingInProfile { get; set; } = true;
        public string? City { get; set; }
        public string? ContactMethod { get; set; }
        public bool IsBanned { get; set; } = false;
        public string? BanReason { get; set; }
        public DateTime? BlockedUntil { get; set; }
        public string? BlockReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
