using Microsoft.AspNetCore.SignalR;
using BookGalaxy.Hubs;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSignalR();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<OrderHub>("/orderHub");
        });
    }
} 