using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookGalaxy.Services.Interfaces;

namespace BookGalaxy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountService _discountService;

        public DiscountController(IDiscountService discountService)
        {
            _discountService = discountService;
        }

        [HttpGet("check-eligibility")]
        [Authorize]
        public async Task<IActionResult> CheckDiscountEligibility()
        {
            var memberId = int.Parse(User.FindFirst("MemberId").Value);
            var eligibility = await _discountService.CheckDiscountEligibilityAsync(memberId);
            
            return Ok(new { 
                isEligibleForLoyaltyDiscount = eligibility.IsEligibleForLoyaltyDiscount,
                fulfilledOrderCount = eligibility.FulfilledOrderCount,
                requiredOrderCount = eligibility.RequiredOrderCount
            });
        }
    }
}
