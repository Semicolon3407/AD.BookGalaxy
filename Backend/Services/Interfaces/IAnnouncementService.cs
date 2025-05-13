using BookGalaxy.DTOs.Announcement;

namespace BookGalaxy.Services.Interfaces
{
    public interface IAnnouncementService
    {
        Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync();
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto);
        Task<AnnouncementDto> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto dto);
        Task<bool> DeleteAnnouncementAsync(int id);
        Task<IEnumerable<AnnouncementDto>> GetActiveAnnouncementsAsync();
    }
}