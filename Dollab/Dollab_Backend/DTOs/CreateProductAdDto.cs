namespace Dollab_Backend.DTOs
{
    public class CreateProductAdDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int CategoryId { get; set; }

        public List<IFormFile> Images { get; set; } = new();
    }
}
