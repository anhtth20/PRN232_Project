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
        public DbSet<Author> Authors { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<BorrowRequest> BorrowRequests { get; set; }
        public DbSet<Fine> Fines { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .UseIdentityColumn();

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
                .Property(b => b.Id)
                .UseIdentityColumn();

            modelBuilder.Entity<Book>()
                .Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Book>()
                .Property(b => b.IsDeleted)
                .HasDefaultValue(false);

            modelBuilder.Entity<Book>()
                .Property(b => b.ImageUrl)
                .HasMaxLength(500); // optional URL to book cover image

            modelBuilder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Author entity configuration
            modelBuilder.Entity<Author>()
                .HasKey(a => a.Id);

            modelBuilder.Entity<Author>()
                .Property(a => a.Id)
                .UseIdentityColumn();

            modelBuilder.Entity<Author>()
                .Property(a => a.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Author>()
                .Property(a => a.IsDeleted)
                .HasDefaultValue(false);

            // Category entity configuration
            modelBuilder.Entity<Category>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Category>()
                .Property(c => c.Id)
                .UseIdentityColumn();

            modelBuilder.Entity<Category>()
                .Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Category>()
                .Property(c => c.IsDeleted)
                .HasDefaultValue(false);

            // BorrowRequest entity configuration
            modelBuilder.Entity<BorrowRequest>()
                .HasKey(br => br.Id);

            modelBuilder.Entity<BorrowRequest>()
                .Property(br => br.Id)
                .UseIdentityColumn();

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
                .Property(f => f.Id)
                .UseIdentityColumn();

            modelBuilder.Entity<Fine>()
                .Property(f => f.Amount)
                .HasPrecision(10, 2);

            // Foreign key: Fine -> BorrowRequest
            modelBuilder.Entity<Fine>()
                .HasOne(f => f.BorrowRequest)
                .WithMany(br => br.Fines)
                .HasForeignKey(f => f.BorrowRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            // ActivityLog entity configuration
            modelBuilder.Entity<ActivityLog>()
                .HasKey(al => al.Id);

            modelBuilder.Entity<ActivityLog>()
                .Property(al => al.Id)
                .UseIdentityColumn();

            modelBuilder.Entity<ActivityLog>()
                .Property(al => al.Action)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<ActivityLog>()
                .Property(al => al.Details)
                .HasMaxLength(200);

            modelBuilder.Entity<ActivityLog>()
                .Property(al => al.MemberName)
                .HasMaxLength(100);

            modelBuilder.Entity<ActivityLog>()
                .Property(al => al.Status)
                .HasMaxLength(50);
        }
    }
}
