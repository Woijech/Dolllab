namespace Dollab_Backend.DTOs
{
    public class UpdatePostDto
    {
        public string? Description { get; set; }

        public IFormFile? Image { get; set; }
    }
}
