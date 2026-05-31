namespace Dollab_Backend.DTOs
{
    public class ActivityStatisticsDto
    {
        public string Date { get; set; } = string.Empty;

        public int Users { get; set; }

        public int Posts { get; set; }

        public int Ads { get; set; }
    }
}
