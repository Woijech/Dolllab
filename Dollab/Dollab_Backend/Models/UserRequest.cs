namespace Dollab_Backend.Models
{
    public class UserRequest
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public UserRequestType Type { get; set; }

        public string Description { get; set; } = string.Empty;

        public List<UserRequestImage> Images { get; set; } = new();
        public UserRequestStatus Status { get; set; } = UserRequestStatus.Pending;

        public string? AdminComment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }
    }
}
