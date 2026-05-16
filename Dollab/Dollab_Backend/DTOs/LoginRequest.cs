using System.ComponentModel.DataAnnotations;

namespace Dollab_Backend.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string Login { get; set; } // <-- теперь универсальное поле

        [Required]
        public string Password { get; set; } = null!;
    }
}
