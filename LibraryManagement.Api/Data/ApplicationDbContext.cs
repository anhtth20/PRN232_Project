using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<BorrowRequest> BorrowRequests { get; set; }
        public DbSet<Fine> Fines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasMaxLength(50);

            // Book entity configuration
            modelBuilder.Entity<Book>()
                .HasKey(b => b.Id);

            modelBuilder.Entity<Book>()
                .Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Book>()
                .Property(b => b.Author)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Book>()
                .Property(b => b.Category)
                .HasMaxLength(100);

            // BorrowRequest entity configuration
            modelBuilder.Entity<BorrowRequest>()
                .HasKey(br => br.Id);

            modelBuilder.Entity<BorrowRequest>()
                .Property(br => br.Status)
                .IsRequired()
                .HasMaxLength(50);

            // Foreign key: BorrowRequest -> User
            modelBuilder.Entity<BorrowRequest>()
                .HasOne(br => br.User)
                .WithMany(u => u.BorrowRequests)
                .HasForeignKey(br => br.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Foreign key: BorrowRequest -> Book
            modelBuilder.Entity<BorrowRequest>()
                .HasOne(br => br.Book)
                .WithMany(b => b.BorrowRequests)
                .HasForeignKey(br => br.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // Fine entity configuration
            modelBuilder.Entity<Fine>()
                .HasKey(f => f.Id);

            modelBuilder.Entity<Fine>()
                .Property(f => f.Amount)
                .HasPrecision(10, 2);

            // Foreign key: Fine -> BorrowRequest
            modelBuilder.Entity<Fine>()
                .HasOne(f => f.BorrowRequest)
                .WithMany(br => br.Fines)
                .HasForeignKey(f => f.BorrowRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
