namespace Dollab_Backend.Models
{
    public class UserRequestImage
    {
        public int Id { get; set; }

        public int UserRequestId { get; set; }
        public UserRequest UserRequest { get; set; } = null!;

        public string ImageUrl { get; set; } = string.Empty;
    }
}
