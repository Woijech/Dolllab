using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/posts")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminPostsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminPostsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Select(p => new
                {
                    p.Id,
                    p.Description,
                    p.CreatedAt,

                    p.IsHidden,
                    p.HiddenReason,
                    p.HiddenAt,

                    User = new
                    {
                        p.User.Id,
                        p.User.Username
                    }
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .Select(p => new
                {
                    p.Id,
                    p.Description,
                    p.CreatedAt,

                    p.IsHidden,
                    p.HiddenReason,
                    p.HiddenAt,

                    User = new
                    {
                        p.User.Id,
                        p.User.Username
                    }
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound("Пост не найден");

            return Ok(post);
        }

        [HttpPost("{id}/hide")]
        public async Task<IActionResult> HidePost(int id, AdminPostActionDto dto)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound("Пост не найден");

            post.IsHidden = true;
            post.HiddenReason = dto.Reason;
            post.HiddenAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Пост скрыт");
        }

        [HttpPost("{id}/unhide")]
        public async Task<IActionResult> UnhidePost(int id)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound("Пост не найден");

            post.IsHidden = false;
            post.HiddenReason = null;
            post.HiddenAt = null;

            await _context.SaveChangesAsync();

            return Ok("Пост снова отображается");
        }
    }
}