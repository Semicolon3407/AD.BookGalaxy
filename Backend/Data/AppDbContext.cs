using Microsoft.EntityFrameworkCore;
using BookGalaxy.Models;
using BCrypt.Net;

namespace BookGalaxy.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Member> Members { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<ProcessedOrder> ProcessedOrders { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<BroadcastMessage> BroadcastMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Book>()
                .HasMany(b => b.Reviews)
                .WithOne(r => r.Book)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Book>()
                .HasMany(b => b.OrderItems)
                .WithOne(oi => oi.Book)
                .HasForeignKey(oi => oi.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ProcessedOrder relationships
            modelBuilder.Entity<ProcessedOrder>()
                .HasOne(p => p.Staff)
                .WithMany(s => s.ProcessedOrders)
                .HasForeignKey(p => p.StaffId);

            modelBuilder.Entity<ProcessedOrder>()
                .HasOne(p => p.Order)
                .WithMany(o => o.ProcessedOrders)
                .HasForeignKey(p => p.OrderId);

            modelBuilder.Entity<Staff>()
                .HasIndex(s => s.Email)
                .IsUnique();

            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.Email)
                .IsUnique();

            modelBuilder.Entity<CartItem>()
                .HasOne(c => c.Member)
                .WithMany(m => m.CartItems)
                .HasForeignKey(c => c.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Member)
                .WithMany(m => m.Orders)
                .HasForeignKey("MemberId")
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Member)
                .WithMany(m => m.Reviews)
                .HasForeignKey("MemberId")
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.Member)
                .WithMany(m => m.Bookmarks)
                .HasForeignKey("MemberId")
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
