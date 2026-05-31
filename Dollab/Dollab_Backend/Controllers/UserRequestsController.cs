using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/user-requests")]
    [ApiController]
    [Authorize]
    public class UserRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUserRequest([FromForm] CreateUserRequestDto dto)
        {
            var currentUserId = User.GetUserId();

            if (string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest("Укажите описание заявки");

            var request = new UserRequest
            {
                UserId = currentUserId,
                Type = dto.Type,
                Description = dto.Description.Trim(),
                Status = UserRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserRequests.Add(request);
            await _context.SaveChangesAsync();

            if (dto.Images != null && dto.Images.Any())
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "user-requests"
                );

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                foreach (var image in dto.Images)
                {
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    var imageUrl = $"/uploads/user-requests/{fileName}";

                    _context.UserRequestImages.Add(new UserRequestImage
                    {
                        UserRequestId = request.Id,
                        ImageUrl = imageUrl
                    });
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Заявка отправлена",
                request.Id
            });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyRequests()
        {
            var currentUserId = User.GetUserId();

            var requests = await _context.UserRequests
                .Include(r => r.Images)
                .Where(r => r.UserId == currentUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Description,
                    r.Status,
                    r.AdminComment,
                    r.CreatedAt,
                    r.ReviewedAt,
                    Images = r.Images.Select(i => i.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(requests);
        }
    }
}