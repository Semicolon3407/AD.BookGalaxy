using System.ComponentModel.DataAnnotations;

namespace BookGalaxy.Models
{
    public class ProcessedOrder
    {
        public int ProcessedOrderId { get; set; }
        
        public int OrderId { get; set; }
        public int StaffId { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

        public virtual Order Order { get; set; } = null!;
        public virtual Staff Staff { get; set; } = null!;
    }
}
