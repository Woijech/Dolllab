using Dollab_Backend.Models;

namespace Dollab_Backend.DTOs
{
    public class AdminUpdateUserRequestDto
    {
        public UserRequestStatus Status { get; set; }

        public string? AdminComment { get; set; }
    }
}
