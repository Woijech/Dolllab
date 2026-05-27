namespace Dollab_Backend.DTOs
{
    public class CreateUserReportDto
    {
        public string Reason { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
