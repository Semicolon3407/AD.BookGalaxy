using Microsoft.EntityFrameworkCore;
using BookGalaxy.Data;
using BookGalaxy.Models;
using BookGalaxy.DTOs.Announcement;
using BookGalaxy.Services.Interfaces;

namespace BookGalaxy.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly AppDbContext _context;

        public AnnouncementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementId = a.AnnouncementId,
                    Title = a.Title,
                    Message = a.Message,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Type = a.Type,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return announcements;
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto)
        {
            var announcement = new Announcement
            {
                Title = dto.Title,
                Message = dto.Message,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return new AnnouncementDto
            {
                AnnouncementId = announcement.AnnouncementId,
                Title = announcement.Title,
                Message = announcement.Message,
                StartTime = announcement.StartTime,
                EndTime = announcement.EndTime,
                Type = announcement.Type,
                CreatedAt = announcement.CreatedAt
            };
        }

        public async Task<AnnouncementDto> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto dto)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
                return null;

            announcement.Title = dto.Title;
            announcement.Message = dto.Message;
            announcement.StartTime = dto.StartTime;
            announcement.EndTime = dto.EndTime;
            announcement.Type = dto.Type;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AnnouncementDto
            {
                AnnouncementId = announcement.AnnouncementId,
                Title = announcement.Title,
                Message = announcement.Message,
                StartTime = announcement.StartTime,
                EndTime = announcement.EndTime,
                Type = announcement.Type,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            };
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
                return false;

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AnnouncementDto>> GetActiveAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            var announcements = await _context.Announcements
                .Where(a => a.StartTime <= now && a.EndTime >= now)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementId = a.AnnouncementId,
                    Title = a.Title,
                    Message = a.Message,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Type = a.Type,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return announcements;
        }
    }
}
