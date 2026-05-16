namespace Dollab_Backend.Models
{
    public class ProductImage
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public int ProductAdId { get; set; }
        public ProductAd ProductAd { get; set; } = null!;
    }
}
