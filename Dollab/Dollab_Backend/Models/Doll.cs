using System.ComponentModel.DataAnnotations;

namespace Dollab_Backend.Models
{
    public class Doll
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        public string? Series { get; set; }

        public string? Description { get; set; }
        public string? Brand { get; set; }
        public string? ImageUrl { get; set; }
        public int ReleaseYear { get; set; }

    }
}
