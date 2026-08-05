namespace EbankingNotificationService.DTOs
{
    public class NotificationEvent
    {
        public int CustomerId { get; set; }

        public string EventType { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        // Optional because every notification does not need email/SMS
        public string? Email { get; set; }

        // Example: ["IN_APP", "EMAIL"]
        public List<string> Channels { get; set; } = new();
    }
}