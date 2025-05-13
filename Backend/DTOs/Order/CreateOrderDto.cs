using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BookGalaxy.DTOs.Cart;

namespace BookGalaxy.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        public List<CartItemDto> Items { get; set; } = new();

        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
    }
}