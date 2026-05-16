namespace Dollab_Backend.Models
{
    public class Follow
    {
        public int Id { get; set; }

        // кто подписался
        public int FollowerId { get; set; }
        public User Follower { get; set; } = null!;

        // на кого подписались
        public int FollowingId { get; set; }
        public User Following { get; set; } = null!;
    }
}
