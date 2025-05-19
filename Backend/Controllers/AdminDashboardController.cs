using BookGalaxy.Data;
using BookGalaxy.Models;
using BookGalaxy.DTOs.Staff;
using BookGalaxy.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace BookGalaxy.Controllers
{
    [ApiController]
    [Route("api/AdminDashboard")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("staffs")]
        public async Task<IActionResult> GetAllStaffs()
        {
            var staffs = await _context.Staffs
                .Select(s => new
                {
                    s.StaffId,
                    s.FullName,
                    s.Email,
                    s.Position
                })
                .ToListAsync();
            return Ok(staffs);
        }

        [HttpPost("staffs")]
        public async Task<IActionResult> AddStaff([FromBody] CreateStaffDto dto)
        {
            if (string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Email) || 
                string.IsNullOrEmpty(dto.Password) || string.IsNullOrEmpty(dto.Position))
            {
                return BadRequest(new { message = "All fields are required" });
            }

            if (await _context.Staffs.AnyAsync(s => s.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var staff = new Staff
            {
                FullName = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Position = dto.Position,
                ProcessedOrders = new List<ProcessedOrder>()
            };

            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();
            
            return Ok(new { 
                message = "Staff added successfully",
                staff = new { 
                    staffId = staff.StaffId,
                    fullName = staff.FullName,
                    email = staff.Email,
                    position = staff.Position
                }
            });
        }

        [HttpDelete("staffs/{staffId}")]
        public async Task<IActionResult> DeleteStaff(int staffId)
        {
            var staff = await _context.Staffs.FirstOrDefaultAsync(s => s.StaffId == staffId);
            if (staff == null) return NotFound(new { message = "Staff not found" });
            
            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Staff removed successfully" });
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetAllMembers()
        {
            var members = await _context.Members
                .Select(m => new
                {
                    m.MemberId,
                    m.FullName,
                    m.Email,
                    m.JoinDate
                })
                .ToListAsync();
            return Ok(members);
        }

        [HttpDelete("members/{memberId}")]
        public async Task<IActionResult> DeleteMember(int memberId)
        {
            var member = await _context.Members
                .Include(m => m.Orders)
                .Include(m => m.CartItems)
                .Include(m => m.Reviews)
                .Include(m => m.Bookmarks)
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) 
                return NotFound(new { message = "Member not found" });
            
            // Delete all associated data
            _context.CartItems.RemoveRange(member.CartItems);
            _context.Reviews.RemoveRange(member.Reviews);
            _context.Bookmarks.RemoveRange(member.Bookmarks);
            
            // For orders, we need to handle the cascade deletion of order items
            foreach (var order in member.Orders)
            {
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.OrderId == order.OrderId)
                    .ToListAsync();
                _context.OrderItems.RemoveRange(orderItems);
            }
            _context.Orders.RemoveRange(member.Orders);
            
            // Finally remove the member
            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Member and all associated data removed successfully" });
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Book)
                .ToListAsync();
            return Ok(orders.Select(o => new
            {
                o.OrderId,
                o.MemberId,
                o.OrderDate,
                o.TotalAmount,
                o.Status,
                Items = o.OrderItems.Select(i => new
                {
                    i.BookId,
                    i.Quantity,
                    i.Price,
                    BookTitle = i.Book?.Title
                })
            }));
        }

        [HttpDelete("reviews/{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound(new { message = "Review not found" });
            
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Review deleted successfully" });
        }

        [HttpGet("dashboard/genres")]
        public async Task<IActionResult> GetGenreDistribution()
        {
            var genres = await _context.Books
                .Where(b => !string.IsNullOrWhiteSpace(b.Genre))
                .GroupBy(b => b.Genre.Trim().ToLower())
                .Select(g => new { Genre = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(genres);
        }

        [HttpGet("dashboard/order-status")]
        public async Task<IActionResult> GetOrderStatusDistribution()
        {
            var statuses = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(statuses);
        }

        [HttpGet("dashboard/order-summary")]
        public async Task<IActionResult> GetOrderSummary()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var fulfilledOrders = await _context.Orders.CountAsync(o => o.Status == "Fulfilled" && !o.IsCancelled);
            var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == "Cancelled" || o.IsCancelled);
            return Ok(new { totalOrders, fulfilledOrders, cancelledOrders });
        }

        [HttpGet("dashboard/monthly-sales")]
        public async Task<IActionResult> GetMonthlySales()
        {
            try
            {
                var now = DateTime.UtcNow;
                var sixMonthsAgo = now.AddMonths(-5).Date;
                
                // Get all months in the range
                var monthRange = Enumerable.Range(0, 6)
                    .Select(i => sixMonthsAgo.AddMonths(i))
                    .Select(date => new
                    {
                        month = $"{date.Year}-{date.Month:D2}",
                        total = 0m
                    })
                    .ToList();

                // Get actual sales data
                var salesData = await _context.Orders
                    .Where(o => o.OrderDate >= sixMonthsAgo && o.OrderDate <= now && !o.IsCancelled)
                    .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new
                    {
                        month = $"{g.Key.Year}-{g.Key.Month:D2}",
                        total = g.Sum(o => o.TotalAmount)
                    })
                    .ToListAsync();

                // Merge the data
                var result = monthRange.Select(m => new
                {
                    month = m.month,
                    total = salesData.FirstOrDefault(s => s.month == m.month)?.total ?? 0m
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMonthlySales: {ex}");
                return StatusCode(500, new { message = "Error fetching monthly sales data", error = ex.Message });
            }
        }

        [HttpGet("dashboard/user-registrations")]
        public async Task<IActionResult> GetUserRegistrations()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
            
            var memberRegistrations = await _context.Members
                .Where(m => m.JoinDate >= sixMonthsAgo)
                .GroupBy(m => new { Month = m.JoinDate.Month, Year = m.JoinDate.Year })
                .Select(g => new {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            var staffRegistrations = await _context.Staffs
                .Where(s => s.JoinDate >= sixMonthsAgo)
                .GroupBy(s => new { Month = s.JoinDate.Month, Year = s.JoinDate.Year })
                .Select(g => new {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(new { Members = memberRegistrations, Staff = staffRegistrations });
        }

        [HttpGet("dashboard/top-bestsellers")]
        public async Task<IActionResult> GetTopBestsellers()
        {
            var topBooks = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Book)
                .Where(oi => oi.Order.Status == "Fulfilled" && !oi.Order.IsCancelled)
                .GroupBy(oi => new { oi.BookId, oi.Book.Title, oi.Book.Author })
                .Select(g => new {
                    g.Key.BookId,
                    g.Key.Title,
                    g.Key.Author,
                    QuantitySold = g.Sum(oi => oi.Quantity)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(5)
                .ToListAsync();
            return Ok(topBooks);
        }

        [HttpGet("dashboard/new-members")]
        public async Task<IActionResult> GetNewMembersOverTime()
        {
            try
            {
                var now = DateTime.UtcNow;
                var sixMonthsAgo = now.AddMonths(-5).Date;

                // Get all months in the range
                var monthRange = Enumerable.Range(0, 6)
                    .Select(i => sixMonthsAgo.AddMonths(i))
                    .Select(date => new
                    {
                        month = $"{date.Year}-{date.Month:D2}",
                        count = 0
                    })
                    .ToList();

                // Get actual member counts
                var memberCounts = await _context.Members
                    .Where(m => m.JoinDate >= sixMonthsAgo && m.JoinDate <= now)
                    .GroupBy(m => new { m.JoinDate.Year, m.JoinDate.Month })
                    .Select(g => new
                    {
                        month = $"{g.Key.Year}-{g.Key.Month:D2}",
                        count = g.Count()
                    })
                    .ToListAsync();

                // Merge the data
                var result = monthRange.Select(m => new
                {
                    month = m.month,
                    count = memberCounts.FirstOrDefault(mc => mc.month == m.month)?.count ?? 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetNewMembersOverTime: {ex}");
                return StatusCode(500, new { message = "Error fetching new members data", error = ex.Message });
            }
        }

        [HttpGet("dashboard/total-sales")]
        public async Task<IActionResult> GetTotalSales()
        {
            var totalSales = await _context.Orders
                .Where(o => o.Status == "Fulfilled" && !o.IsCancelled)
                .SumAsync(o => o.TotalAmount);
            return Ok(new { totalSales });
        }
    }
}