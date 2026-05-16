namespace Dollab_Backend.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ProductAdId { get; set; }
        public ProductAd ProductAd { get; set; } = null!;

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
