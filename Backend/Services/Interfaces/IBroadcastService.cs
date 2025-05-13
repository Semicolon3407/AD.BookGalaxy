using BookGalaxy.DTOs.Broadcast;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookGalaxy.Services.Interfaces
{
    public interface IBroadcastService
    {
        Task CreateMessageAsync(string message);
        Task<List<BroadcastMessageDto>> GetRecentMessagesAsync();
    }
}