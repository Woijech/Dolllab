using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Dollab_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

[ApiController]
[Route("api/[controller]")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;


    public PostController(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto)
    {
        var userId = User.GetUserId();

        if (dto.Image == null)
            return BadRequest("Image is required");

        var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/posts");

        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
        var filePath = Path.Combine(folder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Image.CopyToAsync(stream);
        }

        var post = new Post
        {
            ImageUrl = $"/posts/{fileName}",
            Description = dto.Description,
            UserId = userId
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();
        var followerIds = await _context.Follows
    .Where(f => f.FollowingId == userId)
    .Select(f => f.FollowerId)
    .ToListAsync();

        foreach (var followerId in followerIds)
        {
            await _notificationService.CreateNotificationAsync(
                userId: followerId,
                fromUserId: userId,
                type: NotificationType.NewPost,
                message: "добавил новый пост",
                postId: post.Id
            );
        }
        return Ok(new
        {
            message = "Post created",
            post.Id,
            post.ImageUrl,
            post.Description,
            post.CreatedAt
        });
    }
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePost(int id, [FromForm] UpdatePostDto dto)
    {
        var userId = User.GetUserId();

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
            return NotFound();

        if (post.UserId != userId)
            return Forbid();

        if (dto.Description != null)
        {
            if (dto.Description.Length > 500)
                return BadRequest("Description too long");

            post.Description = dto.Description;
        }

        if (dto.Image != null)
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/posts");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(folder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            post.ImageUrl = $"/posts/{fileName}";
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Post updated",
            post.Id,
            post.ImageUrl,
            post.Description,
            post.CreatedAt
        });
    }
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = User.GetUserId();

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
            return NotFound();

        // 🔒 только владелец может удалить
        if (post.UserId != userId)
            return Forbid();

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Post deleted" });
    }
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyPosts()
    {
        var userId = User.GetUserId();

        var posts = await _context.Posts
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.ImageUrl,
                p.Description,
                p.CreatedAt,
                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == userId)
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(int id)
    {
        int? currentUserId = null;

        if (User.Identity?.IsAuthenticated == true)
        {
            currentUserId = User.GetUserId();
        }

        var post = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Favorites)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
            return NotFound();

        return Ok(new
        {
            post.Id,
            post.ImageUrl,
            post.Description,
            post.CreatedAt,

            LikesCount = post.Likes.Count,
            IsLiked = currentUserId != null && post.Likes.Any(l => l.UserId == currentUserId),
            IsFavorited = currentUserId != null && post.Favorites.Any(f => f.UserId == currentUserId),

            Author = new
            {
                Id = post.User.Id,
                Username = post.User.Username,
                AvatarUrl = post.User.AvatarUrl ?? ""
            }
        });
    }

    [HttpPost("{id}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(int id)
    {
        var userId = User.GetUserId();

        var post = await _context.Posts.FindAsync(id);
        if (post == null)
            return NotFound();

        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == id && l.UserId == userId);

        bool liked;

        if (existingLike != null)
        {
            _context.Likes.Remove(existingLike);
            liked = false;
        }
        else
        {
            var like = new Like
            {
                PostId = id,
                UserId = userId
            };

            _context.Likes.Add(like);
            liked = true;
        }

        await _notificationService.CreateNotificationAsync(
userId: post.UserId,
fromUserId: userId,
type: NotificationType.Like,
message: "лайкнул ваш пост",
postId: post.Id
);
        await _context.SaveChangesAsync();


        var likesCount = await _context.Likes.CountAsync(l => l.PostId == id);

        return Ok(new
        {
            liked,
            likesCount
        });
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        var postExists = await _context.Posts.AnyAsync(p => p.Id == id);

        if (!postExists)
            return NotFound("Post not found");

        var comments = await _context.Comments
            .Where(c => c.PostId == id)
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Text,
                c.CreatedAt,
                Author = new
                {
                    c.User.Id,
                    c.User.Username,
                    AvatarUrl = c.User.AvatarUrl ?? ""
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost("{id}/comments")]
    [Authorize]
    public async Task<IActionResult> CreateComment(int id, [FromBody] CreateCommentDto dto)
    {
        var userId = User.GetUserId();

        var post = await _context.Posts.FindAsync(id);

        if (post == null)
            return NotFound("Post not found");

        if (string.IsNullOrWhiteSpace(dto.Text))
            return BadRequest("Comment is empty");

        if (dto.Text.Length > 500)
            return BadRequest("Comment is too long");

        var comment = new Comment
        {
            Text = dto.Text.Trim(),
            UserId = userId,
            PostId = id
        };

        _context.Comments.Add(comment);

        await _context.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            userId: post.UserId,
            fromUserId: userId,
            type: NotificationType.Comment,
            message: "прокомментировал ваш пост",
            postId: post.Id
        );

        var user = await _context.Users.FindAsync(userId);

        return Ok(new
        {
            comment.Id,
            comment.Text,
            comment.CreatedAt,
            Author = new
            {
                user!.Id,
                user.Username,
                AvatarUrl = user.AvatarUrl ?? ""
            }
        });
    }

    [HttpDelete("comments/{commentId}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        var userId = User.GetUserId();

        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null)
            return NotFound();

        if (comment.UserId != userId)
            return Forbid();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Comment deleted" });
    }

    [HttpPost("{id}/favorite")]
    [Authorize]
    public async Task<IActionResult> ToggleFavorite(int id)
    {
        var userId = User.GetUserId();

        var postExists = await _context.Posts.AnyAsync(p => p.Id == id);

        if (!postExists)
            return NotFound("Post not found");

        var existingFavorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.PostId == id && f.UserId == userId);

        bool isFavorited;

        if (existingFavorite != null)
        {
            _context.Favorites.Remove(existingFavorite);
            isFavorited = false;
        }
        else
        {
            var favorite = new Favorite
            {
                PostId = id,
                UserId = userId
            };

            _context.Favorites.Add(favorite);
            isFavorited = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            isFavorited
        });
    }

    [HttpGet("favorites/my")]
    [Authorize]
    public async Task<IActionResult> GetMyFavoritePosts()
    {
        var userId = User.GetUserId();

        var posts = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Post)
                .ThenInclude(p => p.User)
            .Include(f => f.Post)
                .ThenInclude(p => p.Likes)
            .OrderByDescending(f => f.Id)
            .Select(f => new
            {
                f.Post.Id,
                f.Post.ImageUrl,
                f.Post.Description,
                f.Post.CreatedAt,

                LikesCount = f.Post.Likes.Count,
                IsLiked = f.Post.Likes.Any(l => l.UserId == userId),
                IsFavorited = true,

                Author = new
                {
                    f.Post.User.Id,
                    f.Post.User.Username,
                    AvatarUrl = f.Post.User.AvatarUrl ?? ""
                }
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetFeed()
    {
        var currentUserId = User.GetUserId();
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var followingIds = await _context.Follows
            .Where(f => f.FollowerId == currentUserId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var feedPostsQuery = _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Favorites)
            .Where(p =>
                p.CreatedAt >= weekAgo &&
                (
                    followingIds.Contains(p.UserId) ||
                    p.UserId == currentUserId
                )
            );

        var feedPostIds = await feedPostsQuery
            .Select(p => p.Id)
            .ToListAsync();

        var randomPosts = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Favorites)
            .Where(p => !feedPostIds.Contains(p.Id))
            .OrderBy(p => Guid.NewGuid())
            .Take(5)
            .ToListAsync();

        var feedPosts = await feedPostsQuery
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var result = feedPosts
            .Concat(randomPosts)
            .Select(p => new
            {
                p.Id,
                p.Description,
                p.ImageUrl,
                p.CreatedAt,

                User = new
                {
                    p.User.Id,
                    p.User.Username,
                    p.User.AvatarUrl
                },

                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == currentUserId),

                FavoritesCount = p.Favorites.Count,
                IsFavorite = p.Favorites.Any(f => f.UserId == currentUserId)
            });

        return Ok(result);
    }

    [HttpGet("interesting")]
    [Authorize]
    public async Task<IActionResult> GetInterestingPosts()
    {
        var currentUserId = User.GetUserId();

        var posts = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Favorites)
            .Where(p => p.UserId != currentUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Description,
                p.ImageUrl,
                p.CreatedAt,

                User = new
                {
                    p.User.Id,
                    p.User.Username,
                    p.User.AvatarUrl
                },

                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == currentUserId),

                FavoritesCount = p.Favorites.Count,
                IsFavorite = p.Favorites.Any(f => f.UserId == currentUserId)
            })
            .ToListAsync();

        return Ok(posts);
    }
}