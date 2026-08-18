using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
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
            var senderEmail = _configuration["EmailSettings:SenderEmail"]?.Trim();
            var appPassword = _configuration["EmailSettings:AppPassword"]?.Trim()?.Replace(" ", "");
            var smtpServer = _configuration["EmailSettings:SmtpServer"]?.Trim() ?? "smtp.gmail.com";
            var portStr = _configuration["EmailSettings:Port"]?.Trim() ?? "587";
            var senderName = _configuration["EmailSettings:SenderName"]?.Trim() ?? "Finix Bank";
            var fromAddress = _configuration["EmailSettings:FromAddress"]?.Trim();

            if (string.IsNullOrWhiteSpace(fromAddress))
            {
                fromAddress = senderEmail;
            }

            if (string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(appPassword) || senderEmail.Contains("<FILL_IN"))
            {
                Console.WriteLine($"[EmailService] SMTP credentials not configured. Skipping email dispatch to {toEmail}.");
                return;
            }

            if (!int.TryParse(portStr, out int port))
            {
                port = 587;
            }

            try
            {
                Console.WriteLine($"[EmailService] Attempting to dispatch email to {toEmail} via {smtpServer}:{port}...");

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(senderName, fromAddress));
                email.To.Add(MailboxAddress.Parse(toEmail));
                email.Subject = subject;

                email.Body = new TextPart("html")
                {
                    Text = $@"
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;'>
            <div style='max-width: 600px; margin: auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>
                <div style='margin-bottom: 24px; border-bottom: 2px solid #ff5e3a; padding-bottom: 12px;'>
                    <h2 style='color: #0b132b; margin: 0; font-size: 22px; font-weight: 800;'>
                        {subject}
                    </h2>
                </div>

                <div style='color: #334155; font-size: 15px; line-height: 1.6;'>
                    {message}
                </div>

                <div style='margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;'>
                    <p style='margin: 0;'>Regards,<br/><strong style='color: #0b132b;'>Finix Bank Automated Notifications</strong></p>
                    <p style='margin: 4px 0 0 0; color: #94a3b8;'>This is an automated system notification. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>"
                };

                using var smtp = new SmtpClient();

                // Connect to SMTP Server
                await smtp.ConnectAsync(
                    smtpServer,
                    port,
                    port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls);

                // Authenticate with user & app password
                await smtp.AuthenticateAsync(senderEmail, appPassword);

                // Dispatch Email
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                Console.WriteLine($"[EmailService SUCCESS] Email successfully delivered to {toEmail} (Subject: '{subject}').");
            }
            catch (AuthenticationException authEx)
            {
                Console.WriteLine($"[EmailService ERROR] SMTP Authentication failed for {senderEmail}: {authEx.Message}. Check your Gmail App Password.");
            }
            catch (SmtpCommandException smtpEx)
            {
                Console.WriteLine($"[EmailService ERROR] SMTP Command error ({smtpEx.StatusCode}): {smtpEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService ERROR] Failed to send email to {toEmail}: {ex.Message}");
            }
        }
    }
}