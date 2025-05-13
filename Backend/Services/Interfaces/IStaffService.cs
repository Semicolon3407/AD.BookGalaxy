using BookGalaxy.DTOs.Staff;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BookGalaxy.Services.Interfaces
{
    public interface IStaffService
    {
        Task<string> FulfillOrderAsync(ClaimCodeDto dto, int staffId);
        Task<List<object>> GetFulfilledOrdersAsync();
    }
}