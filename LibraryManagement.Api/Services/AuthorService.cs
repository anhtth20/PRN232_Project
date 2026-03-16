using LibraryManagement.Api.Data;
using LibraryManagement.Api.DTOs;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Services
{
    public interface IAuthorService
    {
        Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync();
        Task<AuthorDto?> GetAuthorByIdAsync(int id);
        Task<AuthorDto> CreateAuthorAsync(AuthorCreateDto authorDto);
        Task<bool> UpdateAuthorAsync(int id, AuthorCreateDto authorDto);
        Task<bool> DeleteAuthorAsync(int id);
    }

    public class AuthorService : IAuthorService
    {
        private readonly ApplicationDbContext _context;

        public AuthorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync()
        {
            return await _context.Authors
                .Where(a => !a.IsDeleted)
                .Select(a => new AuthorDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio
                })
                .ToListAsync();
        }

        public async Task<AuthorDto?> GetAuthorByIdAsync(int id)
        {
            var author = await _context.Authors
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
            if (author == null) return null;

            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Bio = author.Bio
            };
        }

        public async Task<AuthorDto> CreateAuthorAsync(AuthorCreateDto authorDto)
        {
            var author = new Author
            {
                Name = authorDto.Name,
                Bio = authorDto.Bio
            };

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Bio = author.Bio
            };
        }

        public async Task<bool> UpdateAuthorAsync(int id, AuthorCreateDto authorDto)
        {
            var author = await _context.Authors
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
            if (author == null) return false;

            author.Name = authorDto.Name;
            author.Bio = authorDto.Bio;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAuthorAsync(int id)
        {
            var author = await _context.Authors
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
            if (author == null) return false;

            // Check if books are linked to this author
            var holdsBooks = await _context.Books.AnyAsync(b => b.AuthorId == id && !b.IsDeleted);
            if (holdsBooks)
            {
                throw new InvalidOperationException("Cannot delete author because there are still books linked to it.");
            }

            author.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
