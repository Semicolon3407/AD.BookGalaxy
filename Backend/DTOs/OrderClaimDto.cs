using System.ComponentModel.DataAnnotations;

namespace BookGalaxy.DTOs.Staff
{
    public class ClaimCodeDto
    {
        [Required]
        public string ClaimCode { get; set; } = string.Empty;
    }
}