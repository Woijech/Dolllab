using Dollab_Backend.Models;

namespace Dollab_Backend.DTOs
{
    public class CreateUserRequestDto
    {
        public UserRequestType Type { get; set; }

        public string Description { get; set; } = string.Empty;

        public List<IFormFile>? Images { get; set; }
    }
}
