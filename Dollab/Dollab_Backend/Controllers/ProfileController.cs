using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Dollab_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices;

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
            Posts = posts,
            City= user.City,
            ContactMethod = user.ContactMethod,
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

        if (dto.ClearBio)
        {
            user.Bio = null;
        }
        else if (dto.Bio != null)
        {
            var trimmedBio = dto.Bio.Trim();

            if (trimmedBio.Length > 500)
                return BadRequest("Bio too long");

            user.Bio = string.IsNullOrWhiteSpace(trimmedBio) ? null : trimmedBio;
        }

        if (dto.RemoveAvatar)
        {
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

        if (dto.Username != null)
        {
            var newUsername = dto.Username.Trim();

            if (string.IsNullOrWhiteSpace(newUsername))
                return BadRequest("Username cannot be empty");

            if (newUsername.Length < 3)
                return BadRequest("Username must be at least 3 characters");

            if (newUsername.Length > 20)
                return BadRequest("Username too long");

            var exists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == newUsername.ToLower() && u.Id != userId);

            if (exists)
                return BadRequest("Username already taken");

            user.Username = newUsername;
        }

        if (dto.City != null)
        {
            user.City = string.IsNullOrWhiteSpace(dto.City)
                ? null
                : dto.City.Trim();
        }

        if (dto.ContactMethod != null)
        {
            user.ContactMethod = string.IsNullOrWhiteSpace(dto.ContactMethod)
                ? null
                : dto.ContactMethod.Trim();
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            username = user.Username,
            avatarUrl = user.AvatarUrl ?? "",
            bio = user.Bio ?? "",
            city = user.City ?? "",
            contactMethod = user.ContactMethod ?? ""
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
        var isBlockedByProfileOwner = await _context.BlockedUsers
    .AnyAsync(b => b.BlockerId == id && b.BlockedId == currentUserId);

        if (isBlockedByProfileOwner)
        {
            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                avatarUrl = "",
                bio = "",
                isBlocked = true,
                isPrivate = true,
                canFollow = false,
                message = "Пользователь вас заблокировал"
            });
        }

        var followersCount = await _context.Follows
            .CountAsync(f => f.FollowingId == id);

        var followingCount = await _context.Follows
            .CountAsync(f => f.FollowerId == id);

        var isFollowing = await _context.Follows
            .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);

        var requestSent = await _context.FollowRequests
            .AnyAsync(r =>
                r.RequesterId == currentUserId &&
                r.TargetUserId == id &&
                r.Status == "pending");

        if (user.ProfileVisibility == "followers" && currentUserId != id && !isFollowing)
        {
            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                avatarUrl = user.AvatarUrl ?? "",
                bio = user.Bio ?? "",
                profileVisibility = user.ProfileVisibility,
                isPrivate = true,
                isFollowing = false,
                requestSent,
                postsCount = 0,
                followersCount,
                followingCount,
                message = "Профиль закрыт",
                IsBlocked = false,
                CanFollow = true
            });
        }

        var postsQuery = user.Posts.AsQueryable();

        if (currentUserId != id)
        {
            postsQuery = postsQuery.Where(p => !p.IsHidden);
        }

        var posts = postsQuery
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new UserPostDto
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CreatedAt = p.CreatedAt,

                LikesCount = p.Likes.Count,
                IsLiked = p.Likes.Any(l => l.UserId == currentUserId),
                IsFavorited = p.Favorites.Any(f => f.UserId == currentUserId),

                IsHidden = p.IsHidden,
                HiddenReason = p.HiddenReason
            })
            .ToList();

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
            ProfileVisibility = user.ProfileVisibility,
            IsPrivate = false,
            RequestSent = requestSent,
            ShowStoreInProfile = user.ShowStoreInProfile,
            AllowReviews = user.AllowReviews,
            ShowRatingInProfile = user.ShowRatingInProfile,
            Posts = posts,
            City = user.City ?? "",
            ContactMethod = user.ContactMethod ?? ""
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
            .Take(30) 
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

        var targetUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (targetUser == null)
            return NotFound("Пользователь не найден");
        var isBlocked = await _context.BlockedUsers
    .AnyAsync(b =>
        b.BlockerId == id &&
        b.BlockedId == currentUserId);

        if (isBlocked)
            return BadRequest("Вы не можете подписаться на этого пользователя");

        var existingFollow = await _context.Follows
            .FirstOrDefaultAsync(f =>
                f.FollowerId == currentUserId &&
                f.FollowingId == id);

        if (existingFollow != null)
        {
            _context.Follows.Remove(existingFollow);
            await _context.SaveChangesAsync();

            var followersCountAfterUnfollow = await _context.Follows
                .CountAsync(f => f.FollowingId == id);

            return Ok(new
            {
                isFollowing = false,
                requestSent = false,
                followersCount = followersCountAfterUnfollow,
                message = "Вы отписались"
            });
        }

        if (targetUser.ProfileVisibility == "followers")
        {
            var existingRequest = await _context.FollowRequests
                .FirstOrDefaultAsync(r =>
                    r.RequesterId == currentUserId &&
                    r.TargetUserId == id &&
                    r.Status == "pending");

            if (existingRequest != null)
            {
                var followersCountForExistingRequest = await _context.Follows
                    .CountAsync(f => f.FollowingId == id);

                return Ok(new
                {
                    isFollowing = false,
                    requestSent = true,
                    followersCount = followersCountForExistingRequest,
                    message = "Заявка уже отправлена"
                });
            }

            var followRequest = new FollowRequest
            {
                RequesterId = currentUserId,
                TargetUserId = id,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.FollowRequests.Add(followRequest);
            await _context.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(
                userId: id,
                fromUserId: currentUserId,
                type: NotificationType.FollowRequest,
                message: "хочет подписаться на вас",
                followRequestId: followRequest.Id
            );

            var followersCountAfterRequest = await _context.Follows
                .CountAsync(f => f.FollowingId == id);

            return Ok(new
            {
                isFollowing = false,
                requestSent = true,
                followersCount = followersCountAfterRequest,
                message = "Заявка на подписку отправлена"
            });
        }

        var follow = new Follow
        {
            FollowerId = currentUserId,
            FollowingId = id
        };

        _context.Follows.Add(follow);
        await _context.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            userId: id,
            fromUserId: currentUserId,
            type: NotificationType.Follow,
            message: "подписался на вас"
        );

        var followersCountAfterFollow = await _context.Follows
            .CountAsync(f => f.FollowingId == id);

        return Ok(new
        {
            isFollowing = true,
            requestSent = false,
            followersCount = followersCountAfterFollow,
            message = "Вы подписались"
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

    [HttpGet("by-username/{username}")]
    [Authorize]
    public async Task<IActionResult> GetByUsername(string username)
    {
        var user = await _context.Users
            .Where(u => u.Username.ToLower() == username.ToLower())
            .Select(u => new
            {
                id = u.Id,
                username = u.Username
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound();

        return Ok(user);
    }
    [HttpPost("{id}/report")]
    [Authorize]
    public async Task<IActionResult> ReportUser(int id, CreateUserReportDto dto)
    {
        var currentUserId = User.GetUserId();

        if (currentUserId == id)
            return BadRequest("Нельзя пожаловаться на самого себя");

        var reportedUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (reportedUser == null)
            return NotFound("Пользователь не найден");

        if (string.IsNullOrWhiteSpace(dto.Reason))
            return BadRequest("Укажите причину жалобы");

        var alreadyReported = await _context.Reports
            .AnyAsync(r =>
                r.ReporterId == currentUserId &&
                r.ReportedUserId == id &&
                r.Status == ReportStatus.Pending);

        if (alreadyReported)
            return BadRequest("Вы уже отправили жалобу на этого пользователя");

        var report = new Report
        {
            ReporterId = currentUserId,
            ReportedUserId = id,
            Type = ReportType.User,
            Reason = dto.Reason.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description)
                ? null
                : dto.Description.Trim(),
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Жалоба отправлена"
        });
    }
}