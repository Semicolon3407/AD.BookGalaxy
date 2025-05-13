using BookGalaxy.DTOs.Cart;
using BookGalaxy.DTOs.Order;
using BookGalaxy.Models;

namespace BookGalaxy.Services.Interfaces
{
    public interface IOrderService
    {
        Task<Order> PlaceOrderAsync(int memberId, CreateOrderDto dto);
        Task<bool> CancelOrderAsync(int orderId, int memberId);
        Task<List<Order>> GetOrdersByMemberAsync(int memberId);
    }
}