using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using ComicParadise.Repository.Interface;

namespace ComicParadise.Repository.Services
{
    public class EmailService: IEmailService
    {
        private readonly SmtpClient _smtpClient;
        private readonly string _fromEmail;

        public EmailService(IConfiguration configuration)
        {
            _fromEmail = configuration["EmailSettings:FromEmail"];

            _smtpClient = new SmtpClient
            {
                Host = configuration["EmailSettings:SmtpHost"],
                Port = int.Parse(configuration["EmailSettings:SmtpPort"]),
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    configuration["EmailSettings:Username"],
                    configuration["EmailSettings:Password"]
                )
            };
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var mailMessage = new MailMessage(_fromEmail, toEmail, subject, body)
            {
                IsBodyHtml = false // Set to true if using HTML content
            };

            await _smtpClient.SendMailAsync(mailMessage);
        }
    }
}
