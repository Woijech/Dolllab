namespace Dollab_Backend.Models
{
    public class ProductCategory
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public List<ProductAd> ProductAds { get; set; } = new();
    }
}
