namespace Dollab_Backend.DTOs
{
    public class ProfileWithPostsDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;

        public string AvatarUrl { get; set; } = "";

        public string Bio { get; set; } = "";

        public int PostsCount { get; set; }

        public List<UserPostDto> Posts { get; set; } = new();

        public int FollowersCount { get; set; }

        public int FollowingCount { get; set; }

        public bool IsFollowing { get; set; }
        public string ProfileVisibility { get; set; }
        public bool IsPrivate { get; set; }
        public bool RequestSent { get; set; }
        public bool ShowStoreInProfile { get; set; }
        public bool AllowReviews { get; set; }
        public bool ShowRatingInProfile { get; set; }
        public string? City { get; set; }
        public string? ContactMethod { get; set; }
        public bool IsBlocked { get; set; }
        public bool CanFollow { get; set; }
    }
}
