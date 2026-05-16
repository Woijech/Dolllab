using Dollab_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Dollab_Backend.Data;

public class AppDbContext : DbContext
{
    public DbSet<Doll> Dolls { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<Post> Posts { get; set; }

    public DbSet<Like> Likes { get; set; }

    public DbSet<Comment> Comments { get; set; }

    public DbSet<Follow> Follows { get; set; }

    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<ProductAd> ProductAds { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<ProductCategory> ProductCategories { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<UserReview> UserReviews { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Follow>()
            .HasOne(f => f.Follower)
            .WithMany(u => u.Following)
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Follow>()
            .HasOne(f => f.Following)
            .WithMany(u => u.Followers)
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductAd>()
    .HasOne(p => p.User)
    .WithMany(u => u.ProductAds)
    .HasForeignKey(p => p.UserId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductAd>()
            .HasOne(p => p.Category)
            .WithMany(c => c.ProductAds)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductImage>()
            .HasOne(i => i.ProductAd)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductAdId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
    .HasOne(c => c.User)
    .WithMany(u => u.CartItems)
    .HasForeignKey(c => c.UserId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.ProductAd)
            .WithMany()
            .HasForeignKey(c => c.ProductAdId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasIndex(c => new { c.UserId, c.ProductAdId })
            .IsUnique();

        modelBuilder.Entity<UserReview>()
    .HasOne(r => r.Reviewer)
    .WithMany(u => u.ReviewsWritten)
    .HasForeignKey(r => r.ReviewerId)
    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserReview>()
            .HasOne(r => r.ReviewedUser)
            .WithMany(u => u.ReviewsReceived)
            .HasForeignKey(r => r.ReviewedUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserReview>()
            .HasIndex(r => new { r.ReviewerId, r.ReviewedUserId })
            .IsUnique();

        modelBuilder.Entity<Notification>()
    .HasOne(n => n.User)
    .WithMany()
    .HasForeignKey(n => n.UserId)
    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.FromUser)
            .WithMany()
            .HasForeignKey(n => n.FromUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Post)
            .WithMany()
            .HasForeignKey(n => n.PostId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
