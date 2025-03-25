using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetNotificationsAsync(int userID);
    }
}
