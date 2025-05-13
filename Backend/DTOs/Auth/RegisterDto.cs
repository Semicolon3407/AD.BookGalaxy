namespace BookGalaxy.DTOs.Auth
{
    public class RegisterDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // "Member", "Admin", or "Staff"
    }
}