namespace Dollab_Backend.Models
{
    public class BlockedUser
    {
        public int Id { get; set; }

        public int BlockerId { get; set; }
        public User Blocker { get; set; }

        public int BlockedId { get; set; }
        public User Blocked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
