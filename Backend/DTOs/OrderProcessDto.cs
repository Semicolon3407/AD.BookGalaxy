using System.ComponentModel.DataAnnotations;

namespace BookGalaxy.DTOs.Staff
{
    public class ProcessOrderDto
    {
        [Required]
        public string ClaimCode { get; set; } = null!;
    }
}