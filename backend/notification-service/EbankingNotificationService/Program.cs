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
                    ServerVersion.AutoDetect(connectionString)
                ));


            builder.Services.AddControllers();

            builder.Services.AddScoped<IEmailService, EmailService>();

            //builder.Services.AddScoped<ISmsService, SmsService>();

            builder.Services.AddHostedService<RabbitMQConsumer>();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

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
