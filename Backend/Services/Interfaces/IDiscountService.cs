using BookGalaxy.Models;

namespace BookGalaxy.Services.Interfaces
{
    public record DiscountEligibility(bool IsEligibleForLoyaltyDiscount, int FulfilledOrderCount, int RequiredOrderCount);

    public interface IDiscountService
    {
        Task<(decimal DiscountedTotal, bool FivePlusDiscount, bool TenPlusDiscount)> CalculateDiscountsAsync(decimal originalTotal, int memberId, int itemCount);
        Task<DiscountEligibility> CheckDiscountEligibilityAsync(int memberId);
    }
}
