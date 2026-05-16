namespace Dollab_Backend.DTOs
{
    public class UpdateProfileDto
    {
        public string? Bio { get; set; }

        public IFormFile? Avatar { get; set; }

        public bool RemoveAvatar { get; set; } = false;
        public bool ClearBio { get; set; }
        public string? Username { get; set; }

    }
}
