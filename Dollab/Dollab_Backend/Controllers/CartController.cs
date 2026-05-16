using Dollab_Backend.DTOs;
using Dollab_Backend.Data;
using Dollab_Backend.Helpers;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCart()
    {
        var currentUserId = User.GetUserId();

        var cartItems = await _context.CartItems
            .Include(c => c.ProductAd)
                .ThenInclude(p => p.Images)
            .Include(c => c.ProductAd)
                .ThenInclude(p => p.Category)
            .Include(c => c.ProductAd)
                .ThenInclude(p => p.User)
            .Where(c => c.UserId == currentUserId)
            .OrderByDescending(c => c.AddedAt)
            .Select(c => new ProductAdDto
            {
                Id = c.ProductAd.Id,
                Title = c.ProductAd.Title,
                Description = c.ProductAd.Description,
                Price = c.ProductAd.Price,
                CategoryName = c.ProductAd.Category.Name,
                UserId = c.ProductAd.UserId,
                Username = c.ProductAd.User.Username,
                CreatedAt = c.ProductAd.CreatedAt,
                Images = c.ProductAd.Images.Select(i => i.ImageUrl).ToList()
            })
            .ToListAsync();

        return Ok(cartItems);
    }

    [HttpPost("{productAdId}")]
    public async Task<IActionResult> AddToCart(int productAdId)
    {
        var currentUserId = User.GetUserId();

        var productAd = await _context.ProductAds
            .FirstOrDefaultAsync(p => p.Id == productAdId);

        if (productAd == null)
            return NotFound("Объявление не найдено");

        if (productAd.UserId == currentUserId)
            return BadRequest("Нельзя добавить свой товар в корзину");

        var alreadyInCart = await _context.CartItems
            .AnyAsync(c => c.UserId == currentUserId && c.ProductAdId == productAdId);

        if (alreadyInCart)
            return BadRequest("Товар уже есть в корзине");

        var cartItem = new CartItem
        {
            UserId = currentUserId,
            ProductAdId = productAdId
        };

        _context.CartItems.Add(cartItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Товар добавлен в корзину" });
    }

    [HttpDelete("{productAdId}")]
    public async Task<IActionResult> RemoveFromCart(int productAdId)
    {
        var currentUserId = User.GetUserId();

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c =>
                c.UserId == currentUserId &&
                c.ProductAdId == productAdId);

        if (cartItem == null)
            return NotFound("Товар не найден в корзине");

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Товар удалён из корзины" });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var currentUserId = User.GetUserId();

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == currentUserId)
            .ToListAsync();

        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Корзина очищена" });
    }
}