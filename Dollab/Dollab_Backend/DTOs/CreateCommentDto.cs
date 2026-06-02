namespace Dollab_Backend.DTOs
{
    public class CreateCommentDto
    {
        public string Text { get; set; } = null!;
        public int? ParentCommentId { get; set; }

    }
}
