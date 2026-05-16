using Dollab_Backend.DTOs;
using Dollab_Backend.Services;
using Dollab_Backend.Data;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/user-reviews")]
public class UserReviewsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;

    public UserReviewsController(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);

        if (!userExists)
            return NotFound("Пользователь не найден");

        var reviews = await _context.UserReviews
            .Include(r => r.Reviewer)
            .Where(r => r.ReviewedUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new UserReviewDto
            {
                Id = r.Id,
                ReviewerId = r.ReviewerId,
                ReviewerUsername = r.Reviewer.Username,
                Rating = r.Rating,
                Description = r.Description,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost("user/{userId}")]
    [Authorize]
    public async Task<IActionResult> CreateReview(int userId, CreateUserReviewDto dto)
    {
        var currentUserId = User.GetUserId();

        if (currentUserId == userId)
            return BadRequest("Нельзя оставить отзыв самому себе");

        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Оценка должна быть от 1 до 5");

        var reviewedUserExists = await _context.Users.AnyAsync(u => u.Id == userId);

        if (!reviewedUserExists)
            return NotFound("Пользователь не найден");

        var alreadyReviewed = await _context.UserReviews
            .AnyAsync(r =>
                r.ReviewerId == currentUserId &&
                r.ReviewedUserId == userId);

        if (alreadyReviewed)
            return BadRequest("Вы уже оставляли отзыв этому пользователю");

        var review = new UserReview
        {
            ReviewerId = currentUserId,
            ReviewedUserId = userId,
            Rating = dto.Rating,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserReviews.Add(review);
        await _context.SaveChangesAsync();
        await _notificationService.CreateNotificationAsync(
            userId: review.ReviewedUserId,
            fromUserId: currentUserId,
            type: NotificationType.Review,
            message: "оставил отзыв о вас в магазине",
            reviewId: review.Id
        );

        return Ok(new { message = "Отзыв добавлен" });
    }

    [HttpDelete("{reviewId}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int reviewId)
    {
        var currentUserId = User.GetUserId();

        var review = await _context.UserReviews
            .FirstOrDefaultAsync(r => r.Id == reviewId);

        if (review == null)
            return NotFound("Отзыв не найден");

        if (review.ReviewerId != currentUserId)
            return Forbid();

        _context.UserReviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Отзыв удалён" });
    }
}