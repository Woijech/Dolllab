namespace Dollab_Backend.DTOs
{
    public class UserSearchDto
    {
        public int Id { get; set; }

        public string Username { get; set; } = null!;

        public string AvatarUrl { get; set; } = "";

        public string Bio { get; set; } = "";
    }
}
