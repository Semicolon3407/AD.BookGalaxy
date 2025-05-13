using System.ComponentModel.DataAnnotations;

namespace BookGalaxy.DTOs.Review
{
    public class CreateReviewDto
    {
        [Required]
        public int BookId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string Comment { get; set; } = string.Empty;
    }
}