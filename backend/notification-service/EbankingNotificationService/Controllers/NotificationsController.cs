using EbankingNotificationService.Data;
using EbankingNotificationService.Models;
using EbankingNotificationService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EbankingNotificationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationDbContext _context;
        private readonly IEmailService _emailService;

        public NotificationsController(
            NotificationDbContext context,
            IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            var notifications =
                await _context.Notifications.ToListAsync();

            return Ok(notifications);
        }

        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification(
            Notification notification)
        {
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            await _emailService.SendEmailAsync(
                "sandeshwaingade3999@gmail.com",
                "E-Banking Test Email",
                "Your E-Banking Notification Service email integration is working."
            );

            return Ok("Email sent successfully.");
        }
    }
}