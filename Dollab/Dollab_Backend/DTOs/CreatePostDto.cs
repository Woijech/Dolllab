namespace Dollab_Backend.DTOs
{
    public class CreatePostDto
    {
        public string? Description { get; set; }

        public IFormFile Image { get; set; } = null!;
    }
}
