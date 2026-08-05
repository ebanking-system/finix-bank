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
            var email = new MimeMessage();

            email.From.Add(
                MailboxAddress.Parse(
                    _configuration["EmailSettings:SenderEmail"]));

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
                _configuration["EmailSettings:SenderEmail"],
                _configuration["EmailSettings:AppPassword"]);

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
    }
}