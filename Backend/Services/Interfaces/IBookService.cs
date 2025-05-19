using BookGalaxy.DTOs.Book;
using BookGalaxy.Models;

namespace BookGalaxy.Services.Interfaces
{
    public interface IBookService
    {
        Task<List<BookResponseDto>> GetAllBooksAsync();
        Task<BookResponseDto?> GetBookByIdAsync(int bookId);
        Task<Book?> CreateBookAsync(BookCreateDto dto);
        Task<Book?> UpdateBookAsync(int bookId, BookUpdateDto dto);
        Task<bool> DeleteBookAsync(int bookId);
        Task<List<BookResponseDto>> GetBooksAsync(BookQueryParameters query);
    }
}
