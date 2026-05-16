namespace Dollab_Backend.DTOs
{
    public class ProductAdDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string Username { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public List<string> Images { get; set; } = new();
        public int CategoryId { get; set; }
    }
}
