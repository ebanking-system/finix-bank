using Microsoft.EntityFrameworkCore;
using EbankingNotificationService.Data;
using EbankingNotificationService.Consumers;
using EbankingNotificationService.Services;

namespace EbankingNotificationService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            var connectionString =
            builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<NotificationDbContext>(options =>
                options.UseMySql(
                    connectionString,
                    new MySqlServerVersion(new Version(8, 0, 36)),
                    mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 10,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null
                    )
                ));

            builder.Services.AddControllers();

            builder.Services.AddScoped<IEmailService, EmailService>();

            //builder.Services.AddScoped<ISmsService, SmsService>();

            builder.Services.AddHostedService<RabbitMQConsumer>();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Automatically apply EF Core Migrations on startup
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<Program>>();
                var dbContext = services.GetRequiredService<NotificationDbContext>();

                int maxRetries = 10;
                for (int attempt = 1; attempt <= maxRetries; attempt++)
                {
                    try
                    {
                        logger.LogInformation("Applying EF Core migrations for NotificationDbContext (attempt {Attempt}/{MaxRetries})...", attempt, maxRetries);
                        dbContext.Database.Migrate();
                        logger.LogInformation("Database migrations applied successfully.");
                        break;
                    }
                    catch (Exception ex)
                    {
                        if (attempt == maxRetries)
                        {
                            logger.LogError(ex, "Could not apply database migrations after {MaxRetries} attempts.", maxRetries);
                            throw;
                        }
                        logger.LogWarning(ex, "Database not ready yet for migrations. Retrying in 5 seconds... ({RetriesLeft} attempts left)", maxRetries - attempt);
                        Thread.Sleep(5000);
                    }
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
