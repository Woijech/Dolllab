using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Dollab_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;

    public ProfileController(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet("me/full")]
    [Authorize]
    public async Task<IActionResult> GetMyFullProfile()
    {
        var userId = User.GetUserId();

        var user = await _context.Users
            .Include(u => u.Posts)
                .ThenInclude(p => p.Likes)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        var posts = user.Posts
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new UserPostDto
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == userId)
            })
            .ToList();

        var followersCount = await _context.Follows
            .CountAsync(f => f.FollowingId == userId);

        var followingCount = await _context.Follows
            .CountAsync(f => f.FollowerId == userId);

        return Ok(new ProfileWithPostsDto
        {
            Id = user.Id,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
            Bio = user.Bio ?? "",
            PostsCount = posts.Count,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            IsFollowing = false,
            Posts = posts
        });
    }

    [HttpPatch]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
    {
        var userId = User.GetUserId();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        // 🧠 BIO
        if (dto.ClearBio)
        {
            user.Bio = null;
        }
        else if (dto.Bio != null)
        {
            var trimmedBio = dto.Bio.Trim();

            if (trimmedBio.Length > 300)
                return BadRequest("Bio too long");

            user.Bio = string.IsNullOrWhiteSpace(trimmedBio) ? null : trimmedBio;
        }

        // 🗑 УДАЛЕНИЕ АВАТАРКИ
        if (dto.RemoveAvatar)
        {
            // удаляем файл с диска (если есть)
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var filePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    user.AvatarUrl.TrimStart('/')
                );

                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            user.AvatarUrl = null;
        }

        // 📸 НОВАЯ АВАТАРКА
        if (dto.Avatar != null)
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/avatars");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Avatar.FileName)}";
            var filePath = Path.Combine(folder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Avatar.CopyToAsync(stream);
            }

            user.AvatarUrl = $"/avatars/{fileName}";
        }

        // 👤 USERNAME
        if (dto.Username != null)
        {
            var newUsername = dto.Username.Trim();

            if (string.IsNullOrWhiteSpace(newUsername))
                return BadRequest("Username cannot be empty");

            if (newUsername.Length < 3)
                return BadRequest("Username must be at least 3 characters");

            if (newUsername.Length > 20)
                return BadRequest("Username too long");

            // проверка на занятость
            var exists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == newUsername.ToLower() && u.Id != userId);

            if (exists)
                return BadRequest("Username already taken");

            user.Username = newUsername;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            username = user.Username,
            avatarUrl = user.AvatarUrl ?? "",
            bio = user.Bio ?? ""
        });
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetUserProfile(int id)
    {
        var currentUserId = User.GetUserId();

        var user = await _context.Users
            .Include(u => u.Posts)
                .ThenInclude(p => p.Likes)
            .Include(u => u.Posts)
                .ThenInclude(p => p.Favorites)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        var posts = user.Posts
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new UserPostDto
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == currentUserId),
                IsFavorited = p.Favorites.Any(f => f.UserId == currentUserId)
            })
            .ToList();

        var followersCount = await _context.Follows
            .CountAsync(f => f.FollowingId == id);

        var followingCount = await _context.Follows
            .CountAsync(f => f.FollowerId == id);

        var isFollowing = await _context.Follows
            .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);

        return Ok(new ProfileWithPostsDto
        {
            Id = user.Id,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
            Bio = user.Bio ?? "",
            PostsCount = posts.Count,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            IsFollowing = isFollowing,
            Posts = posts
        });
    }
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest("Query is empty");

        var users = await _context.Users
            .Where(u => u.Username.ToLower().Contains(query.ToLower()))
            .Select(u => new UserSearchDto
            {
                Id = u.Id,
                Username = u.Username,
                AvatarUrl = u.AvatarUrl ?? "",
                Bio = u.Bio ?? ""
            })
            .Take(20) // ограничение
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("{id}/follow")]
    [Authorize]
    public async Task<IActionResult> ToggleFollow(int id)
    {
        var currentUserId = User.GetUserId();

        if (currentUserId == id)
            return BadRequest("You cannot follow yourself");

        var userExists = await _context.Users.AnyAsync(u => u.Id == id);
        if (!userExists)
            return NotFound();

        var existing = await _context.Follows
            .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);

        bool isFollowing;

        if (existing != null)
        {
            _context.Follows.Remove(existing);
            isFollowing = false;
        }
        else
        {
            var follow = new Follow
            {
                FollowerId = currentUserId,
                FollowingId = id
            };

            _context.Follows.Add(follow);
            isFollowing = true;
        }

        await _context.SaveChangesAsync();
        await _notificationService.CreateNotificationAsync(
    userId: id,
    fromUserId: currentUserId,
    type: NotificationType.Follow,
    message: "подписался на вас"
);

        var followersCount = await _context.Follows.CountAsync(f => f.FollowingId == id);

        return Ok(new
        {
            isFollowing,
            followersCount
        });
    }

    [HttpGet("{id}/followers")]
    public async Task<IActionResult> GetFollowers(int id)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == id);

        if (!userExists)
            return NotFound("User not found");

        var followers = await _context.Follows
            .Where(f => f.FollowingId == id)
            .Include(f => f.Follower)
            .Select(f => new
            {
                f.Follower.Id,
                f.Follower.Username,
                AvatarUrl = f.Follower.AvatarUrl ?? ""
            })
            .ToListAsync();

        return Ok(followers);
    }

    [HttpGet("{id}/following")]
    public async Task<IActionResult> GetFollowing(int id)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == id);

        if (!userExists)
            return NotFound("User not found");

        var following = await _context.Follows
            .Where(f => f.FollowerId == id)
            .Include(f => f.Following)
            .Select(f => new
            {
                f.Following.Id,
                f.Following.Username,
                AvatarUrl = f.Following.AvatarUrl ?? ""
            })
            .ToListAsync();

        return Ok(following);
    }
}