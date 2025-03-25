using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class NotificationRepository: INotificationRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public NotificationRepository(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<List<Notification>> GetNotificationsAsync (int userID)
        {
            var notifications = await (from n in _context.Notifications
                                       where n.ReceiverId == userID
                                       orderby n.CreatedAt
                                       select n).AsNoTracking().ToListAsync();
            return notifications;
        }
    }
}
