using Dollab_Backend.Data;
using Dollab_Backend.DTOs;
using Dollab_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DollsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DollsController(AppDbContext context)
        {
            _context = context;
        }

        // ===== Получить все куклы (доступно всем) =====
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DollFilterDto filter)
        {
            var query = _context.Dolls.AsQueryable();

            // 🔍 Поиск
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(d =>
                    d.Name.Contains(filter.Search) ||
                    (d.Brand != null && d.Brand.Contains(filter.Search)) ||
                    (d.Series != null && d.Series.Contains(filter.Search))
                );
            }

            // 🏷 Бренд
            if (!string.IsNullOrWhiteSpace(filter.Brand))
            {
                query = query.Where(d => d.Brand == filter.Brand);
            }

            // 📦 Серия
            if (!string.IsNullOrWhiteSpace(filter.Series))
            {
                query = query.Where(d => d.Series == filter.Series);
            }

            // 📅 Год выпуска
            if (filter.ReleaseYear.HasValue)
            {
                query = query.Where(d => d.ReleaseYear == filter.ReleaseYear);
            }

            var dolls = await query
                .Select(d => new DollDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Brand = d.Brand ?? "неизвестен",
                    Series = d.Series,
                    Description = d.Description,
                    ImageUrl = d.ImageUrl,
                    ReleaseYear = d.ReleaseYear
                })
                .ToListAsync();

            return Ok(dolls);
        }

        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _context.Dolls
                .Where(d => d.Brand != null && d.Brand != "")
                .Select(d => d.Brand!)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync();

            return Ok(brands);
        }

        [HttpGet("years")]
        public async Task<IActionResult> GetReleaseYears()
        {
            var years = await _context.Dolls
                .Select(d => d.ReleaseYear)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            return Ok(years);
        }


        // ===== Получить куклу по ID (доступно всем) =====
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doll = await _context.Dolls.FindAsync(id);
            if (doll == null)
                return NotFound();

            return Ok(doll);
        }

        // ===== Добавить куклу (ТОЛЬКО Admin) =====
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddDoll(CreateDollDto dto)
        {
            var doll = new Doll
            {
                Name = dto.Name,
                Brand = dto.Brand,
                Series = dto.Series,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                ReleaseYear = dto.ReleaseYear
            };

            _context.Dolls.Add(doll);
            await _context.SaveChangesAsync();

            return Ok(doll);
        }


        // ===== Обновить куклу (ТОЛЬКО Admin) =====
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, Doll updatedDoll)
        {
            if (id != updatedDoll.Id)
                return BadRequest("ID mismatch");

            var doll = await _context.Dolls.FindAsync(id);
            if (doll == null)
                return NotFound();

            doll.Name = updatedDoll.Name;
            doll.Brand = updatedDoll.Brand;
            doll.Series = updatedDoll.Series;
            doll.Description = updatedDoll.Description;
            doll.ImageUrl = updatedDoll.ImageUrl;
            doll.ReleaseYear = updatedDoll.ReleaseYear;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // ===== Удалить куклу (ТОЛЬКО Admin) =====
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var doll = await _context.Dolls.FindAsync(id);
            if (doll == null)
                return NotFound();

            _context.Dolls.Remove(doll);
            await _context.SaveChangesAsync();

            return Ok("Doll deleted");
        }
    }
}
