namespace BookGalaxy.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendClaimCodeEmailAsync(string toEmail, string memberName, string claimCode, decimal totalAmount);
    }
}