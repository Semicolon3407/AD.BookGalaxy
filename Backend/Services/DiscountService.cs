using BookGalaxy.Data;
using BookGalaxy.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookGalaxy.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly AppDbContext _context;
        private const decimal FIVE_PLUS_DISCOUNT = 0.05m; // 5% discount for 5+ books
        private const decimal TEN_PLUS_DISCOUNT = 0.10m; // 10% discount for 10+ books
        private const int FIVE_PLUS_THRESHOLD = 5; // 5+ books threshold
        private const int TEN_PLUS_THRESHOLD = 10; // 10+ books threshold

        public async Task<DiscountEligibility> CheckDiscountEligibilityAsync(int memberId)
        {
            var fulfilledOrderCount = await _context.Orders
                .Where(o => o.MemberId == memberId && 
                           o.Status == "Fulfilled" && 
                           !o.IsCancelled)
                .CountAsync();

            return new DiscountEligibility(
                IsEligibleForLoyaltyDiscount: fulfilledOrderCount >= LOYALTY_ORDER_THRESHOLD,
                FulfilledOrderCount: fulfilledOrderCount,
                RequiredOrderCount: LOYALTY_ORDER_THRESHOLD
            );
        }

        public DiscountService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(decimal DiscountedTotal, bool FivePlusDiscount, bool TenPlusDiscount)> CalculateDiscountsAsync(
            decimal originalTotal, int memberId, int itemCount)
        {
            decimal finalTotal = originalTotal;
            bool fivePlusDiscount = false;
            bool tenPlusDiscount = false;

            // Apply 10% discount for orders with 10+ books
            if (itemCount >= TEN_PLUS_THRESHOLD)
            {
                finalTotal *= (1 - TEN_PLUS_DISCOUNT);
                tenPlusDiscount = true;
            }
            // Apply 5% discount for orders with 5-9 books
            else if (itemCount >= FIVE_PLUS_THRESHOLD)
            {
                finalTotal *= (1 - FIVE_PLUS_DISCOUNT);
                fivePlusDiscount = true;
            }

            return (finalTotal, fivePlusDiscount, tenPlusDiscount);
        }
    }
}
