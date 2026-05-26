using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [Route("api/admin/categories")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ProductCategories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Категория не найдена");

            return Ok(category);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory(ProductCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Название категории обязательно");

            var name = dto.Name.Trim();

            var exists = await _context.ProductCategories
                .AnyAsync(c => c.Name.ToLower() == name.ToLower());

            if (exists)
                return BadRequest("Такая категория уже существует");

            var category = new ProductCategory
            {
                Name = name
            };

            _context.ProductCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, ProductCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Название категории обязательно");

            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Категория не найдена");

            var name = dto.Name.Trim();

            var exists = await _context.ProductCategories
                .AnyAsync(c => c.Id != id && c.Name.ToLower() == name.ToLower());

            if (exists)
                return BadRequest("Такая категория уже существует");

            category.Name = name;

            await _context.SaveChangesAsync();

            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Категория не найдена");

            _context.ProductCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok("Категория удалена");
        }
    }
}