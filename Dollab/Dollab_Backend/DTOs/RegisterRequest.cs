using Dollab_Backend.Auth;

namespace Dollab_Backend.DTOs
{
    public class RegisterRequest
    {
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = Roles.User; // User или Creator
    }
}
