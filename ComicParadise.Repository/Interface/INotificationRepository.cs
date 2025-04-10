using ComicParadise.DataContext.Dto;
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
        Task<dynamic> GetNotificationsAsync (int userID);
        Task<string> TurnOffNotificationAsync(int notificationID);
        Task<bool> UpdateIsReadStatusAsync(List<int> newNotifications);
        Task<string> CreateNotificationAsync(CreateNotificationDto notificationDto);
    }
}
