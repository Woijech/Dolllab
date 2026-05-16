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
    }
}
