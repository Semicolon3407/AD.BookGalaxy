using BookGalaxy.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace BookGalaxy.Data;

public static class DbSeeder
{
    public static async Task SeedData(AppDbContext context)
    {
        // Check if any admin exists
        var adminExists = await context.Admins.AnyAsync();
        
        if (!adminExists)
        {
            // Create admin user with properly hashed password
            var admin = new Admin
            {
                Email = "admin@bookgalaxy.com",
                FullName = "System Administrator",
                // Hash the password "Admin1234"
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234")
            };

            await context.Admins.AddAsync(admin);
            await context.SaveChangesAsync();
        }
        else
        {
            // Update existing admin's password if needed
            var admin = await context.Admins.FirstOrDefaultAsync();
            if (admin != null)
            {
                // Update with newly hashed password
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234");
                await context.SaveChangesAsync();
            }
        }
    }
} 