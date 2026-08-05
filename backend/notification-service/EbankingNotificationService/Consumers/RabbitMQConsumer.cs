using EbankingNotificationService.Data;
using EbankingNotificationService.DTOs;
using EbankingNotificationService.Models;
using EbankingNotificationService.Services;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace EbankingNotificationService.Consumers
{
    public class RabbitMQConsumer : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _scopeFactory;

        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQConsumer(
            IConfiguration configuration,
            IServiceScopeFactory scopeFactory)
        {
            _configuration = configuration;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:HostName"]!,
                Port = int.Parse(_configuration["RabbitMQ:Port"]!),
                UserName = _configuration["RabbitMQ:UserName"]!,
                Password = _configuration["RabbitMQ:Password"]!
            };

            _connection =
                await factory.CreateConnectionAsync(stoppingToken);

            _channel =
                await _connection.CreateChannelAsync(
                    cancellationToken: stoppingToken);

            var queueName =
                _configuration["RabbitMQ:QueueName"]!;

            await _channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null,
                cancellationToken: stoppingToken);

            Console.WriteLine(
                $"Waiting for messages from: {queueName}");

            var consumer =
                new AsyncEventingBasicConsumer(_channel);

            consumer.ReceivedAsync += async (sender, eventArgs) =>
            {
                try
                {
                    // Convert RabbitMQ message bytes to JSON
                    var body = eventArgs.Body.ToArray();
                    var json = Encoding.UTF8.GetString(body);

                    Console.WriteLine($"Received: {json}");

                    // Deserialize JSON
                    var notificationEvent =
                        JsonSerializer.Deserialize<NotificationEvent>(
                            json,
                            new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });

                    if (notificationEvent == null)
                    {
                        throw new Exception("Invalid notification message.");
                    }

                    // -----------------------------
                    // IN-APP Notification
                    // -----------------------------
                    if (notificationEvent.Channels.Contains(
                        "IN_APP",
                        StringComparer.OrdinalIgnoreCase))
                    {
                        using var scope =
                            _scopeFactory.CreateScope();

                        var dbContext =
                            scope.ServiceProvider
                                .GetRequiredService<NotificationDbContext>();

                        var notification = new Notification
                        {
                            CustomerId = notificationEvent.CustomerId,
                            Title = notificationEvent.Title,
                            Message = notificationEvent.Message,
                            IsRead = false
                        };

                        dbContext.Notifications.Add(notification);

                        await dbContext.SaveChangesAsync();

                        Console.WriteLine(
                            "IN_APP notification saved.");
                    }

                    // -----------------------------
                    // EMAIL Notification
                    // -----------------------------
                    if (notificationEvent.Channels.Contains(
                        "EMAIL",
                        StringComparer.OrdinalIgnoreCase))
                    {
                        if (string.IsNullOrWhiteSpace(notificationEvent.Email))
                        {
                            throw new Exception(
                                "Email address is required.");
                        }

                        using var scope =
                            _scopeFactory.CreateScope();

                        var emailService =
                            scope.ServiceProvider
                                .GetRequiredService<IEmailService>();

                        await emailService.SendEmailAsync(
                            notificationEvent.Email,
                            notificationEvent.Title,
                            notificationEvent.Message);

                        Console.WriteLine(
                            $"Email sent to {notificationEvent.Email}");
                    }

                    // ACK
                    await _channel.BasicAckAsync(
                        eventArgs.DeliveryTag,
                        false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Error processing notification: {ex.Message}");

                    await _channel.BasicNackAsync(
                        eventArgs.DeliveryTag,
                        false,
                        false);
                }
            };

            await _channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: false,
                consumer: consumer,
                cancellationToken: stoppingToken);

            await Task.Delay(
                Timeout.Infinite,
                stoppingToken);
        }

        public override async Task StopAsync(
            CancellationToken cancellationToken)
        {
            if (_channel != null)
            {
                await _channel.CloseAsync();
            }

            if (_connection != null)
            {
                await _connection.CloseAsync();
            }

            await base.StopAsync(cancellationToken);
        }
    }
}