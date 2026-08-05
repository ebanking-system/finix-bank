using System;
using System.Collections.Generic;

namespace EbankingNotificationService.Models;

public partial class Notification
{
    public int NotificationId { get; set; }

    public int CustomerId { get; set; }

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime CreatedDate { get; set; }
}
