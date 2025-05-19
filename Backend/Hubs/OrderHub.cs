using Microsoft.AspNetCore.SignalR;
using BookGalaxy.Models;

namespace BookGalaxy.Hubs
{
    public class OrderHub : Hub
    {
        public async Task BroadcastOrder(Order order)
        {
            await Clients.All.SendAsync("ReceiveOrder", new
            {
                orderId = order.OrderId,
                bookTitle = order.OrderItems.FirstOrDefault()?.Book?.Title ?? "Unknown Book",
                memberName = order.Member?.FullName ?? "Anonymous",
                timestamp = DateTime.UtcNow
            });
        }

        public async Task JoinOrderGroup(string role)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, role);
        }

        public async Task LeaveOrderGroup(string role)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, role);
        }
    }
}