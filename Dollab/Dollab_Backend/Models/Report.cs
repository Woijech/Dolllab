namespace Dollab_Backend.Models
{
    public class Report
    {
        public int Id { get; set; }

        public int ReporterId { get; set; }
        public User Reporter { get; set; } = null!;

        public int? ReportedUserId { get; set; }
        public User ReportedUser { get; set; } = null!;

        public ReportType Type { get; set; } = ReportType.User;

        public string Reason { get; set; } = string.Empty;

        public string? Description { get; set; }

        public ReportStatus Status { get; set; } = ReportStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ReportedPostId { get; set; }
        public Post? ReportedPost { get; set; }

        public int? ReportedProductAdId { get; set; }
        public ProductAd? ReportedProductAd { get; set; }
    }
}
