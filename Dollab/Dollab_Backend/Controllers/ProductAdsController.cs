using Dollab_Backend.DTOs;
using Dollab_Backend.Data;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/product-ads")]
public class ProductAdsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductAdsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateProductAd([FromForm] CreateProductAdDto dto)
    {
        var currentUserId = User.GetUserId();

        var categoryExists = await _context.ProductCategories
            .AnyAsync(c => c.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Категория не найдена");

        var productAd = new ProductAd
        {
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            UserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProductAds.Add(productAd);
        await _context.SaveChangesAsync();

        if (dto.Images != null && dto.Images.Any())
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            foreach (var image in dto.Images)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                var imageUrl = $"/uploads/products/{fileName}";

                _context.ProductImages.Add(new ProductImage
                {
                    ProductAdId = productAd.Id,
                    ImageUrl = imageUrl
                });
            }

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Объявление создано",
            productAd.Id
        });
    }

[HttpGet]
[Authorize]
    public async Task<IActionResult> GetProductAds(
    [FromQuery] int? categoryId,
    [FromQuery] decimal? priceFrom,
    [FromQuery] decimal? priceTo,
    [FromQuery] string? search)
{
        var currentUserId = User.GetUserId();

        var usersWhoBlockedMe = await _context.BlockedUsers
            .Where(b => b.BlockedId == currentUserId)
            .Select(b => b.BlockerId)
            .ToListAsync();

        var query = _context.ProductAds
        .Include(p => p.User)
        .Include(p => p.Category)
        .Include(p => p.Images)
        .AsQueryable();
        query = query.Where(p => !usersWhoBlockedMe.Contains(p.UserId));

        if (!string.IsNullOrWhiteSpace(search))
    {
        var searchText = search.Trim().ToLower();

        query = query.Where(p =>
            p.Title.ToLower().Contains(searchText) ||
            p.Description.ToLower().Contains(searchText) ||
            p.Category.Name.ToLower().Contains(searchText));
    }

    if (categoryId.HasValue)
    {
        query = query.Where(p => p.CategoryId == categoryId.Value);
    }

    if (priceFrom.HasValue)
    {
        query = query.Where(p => p.Price >= priceFrom.Value);
    }

    if (priceTo.HasValue)
    {
        query = query.Where(p => p.Price <= priceTo.Value);
    }

    var ads = await query
        .OrderByDescending(p => p.CreatedAt)
        .Select(p => new ProductAdDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Price = p.Price,
            CategoryName = p.Category.Name,
            UserId = p.UserId,
            Username = p.User.Username,
            CreatedAt = p.CreatedAt,
            CategoryId = p.CategoryId,
            Images = p.Images.Select(i => i.ImageUrl).ToList()
        })
        .ToListAsync();

    return Ok(ads);
}

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductAdById(int id)
    {
        var ad = await _context.ProductAds
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.Id == id)
            .Select(p => new ProductAdDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                CategoryName = p.Category.Name,
                UserId = p.UserId,
                Username = p.User.Username,
                CreatedAt = p.CreatedAt,
                CategoryId = p.CategoryId,
                Images = p.Images.Select(i => i.ImageUrl).ToList()
            })
            .FirstOrDefaultAsync();

        if (ad == null)
            return NotFound("Объявление не найдено");

        return Ok(ad);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyProductAds()
    {
        var currentUserId = User.GetUserId();

        var ads = await _context.ProductAds
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.UserId == currentUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductAdDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                CategoryName = p.Category.Name,
                UserId = p.UserId,
                Username = p.User.Username,
                CreatedAt = p.CreatedAt,
                CategoryId = p.CategoryId,
                Images = p.Images.Select(i => i.ImageUrl).ToList()
            })
            .ToListAsync();

        return Ok(ads);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserProductAds(int userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);

        if (!userExists)
            return NotFound("Пользователь не найден");

        var ads = await _context.ProductAds
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductAdDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                CategoryName = p.Category.Name,
                UserId = p.UserId,
                Username = p.User.Username,
                CreatedAt = p.CreatedAt,
                CategoryId = p.CategoryId,
                Images = p.Images.Select(i => i.ImageUrl).ToList()
            })
            .ToListAsync();

        return Ok(ads);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.ProductCategories
            .OrderBy(c => c.Name)
            .Select(c => new ProductCategoryDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProductAd(int id, UpdateProductAdDto dto)
    {
        var currentUserId = User.GetUserId();

        var productAd = await _context.ProductAds
            .FirstOrDefaultAsync(p => p.Id == id);

        if (productAd == null)
            return NotFound("Объявление не найдено");

        if (productAd.UserId != currentUserId)
            return Forbid();

        var categoryExists = await _context.ProductCategories
            .AnyAsync(c => c.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Категория не найдена");

        productAd.Title = dto.Title;
        productAd.Description = dto.Description;
        productAd.Price = dto.Price;
        productAd.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Объявление обновлено" });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProductAd(int id)
    {
        var currentUserId = User.GetUserId();

        var productAd = await _context.ProductAds
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (productAd == null)
            return NotFound("Объявление не найдено");

        if (productAd.UserId != currentUserId)
            return Forbid();

        foreach (var image in productAd.Images)
        {
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                image.ImageUrl.TrimStart('/')
            );

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.ProductAds.Remove(productAd);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Объявление удалено" });
    }
}