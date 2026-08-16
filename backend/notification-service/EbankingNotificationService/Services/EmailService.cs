using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EbankingNotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string message)
        {
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var appPassword = _configuration["EmailSettings:AppPassword"];

            if (string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(appPassword))
            {
                Console.WriteLine($"[EmailService] SMTP credentials not configured. Skipping email dispatch to {toEmail}.");
                return;
            }

            var email = new MimeMessage();

            email.From.Add(
                MailboxAddress.Parse(senderEmail));

            email.To.Add(MailboxAddress.Parse(toEmail));

            email.Subject = subject;

            email.Body = new TextPart("html")
            {
                Text = $@"
        <html>
        <body style='font-family:Arial,sans-serif;'>

            <h2 style='color:#0d6efd'>
                {subject}
            </h2>

            <p>
                {message}
            </p>

            <br/>

            <hr/>

            <p>
                Regards,<br/>
                <strong>Finix Bank</strong>
            </p>

        </body>
        </html>"
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:Port"]!),
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                senderEmail,
                appPassword);

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
    }
}