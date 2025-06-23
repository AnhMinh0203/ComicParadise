using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<NotificationHub> _hubContext;
        public NotificationRepository(AppDbContext context, IConfiguration config, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _config = config;
            _hubContext = hubContext;
        }

        #region Get notifications
        public async Task<dynamic> GetNotificationsAsync(int userID)
        {
            var newNotifications = await (from n in _context.Notifications
                                          where n.ReceiverId == userID && n.IsShow == true && n.IsRead == false
                                          orderby n.CreatedAt
                                          select n).AsNoTracking().ToListAsync();

            var oldNotifications = await (from n in _context.Notifications
                                          where n.ReceiverId == userID && n.IsShow == true && n.IsRead == true
                                          orderby n.CreatedAt descending
                                          select n).AsNoTracking().Take(20).ToListAsync();
            return new
            {
                TotalNewNotify = newNotifications.Count,
                NewNotifications = newNotifications,
                OldNotifications = oldNotifications
            };
        }
        #endregion

        #region Turn off notification
        public async Task<string> TurnOffNotificationAsync(int notificationID)
        {
            var notification = await _context.Notifications.FindAsync(notificationID);
            if (notification == null)
            {
                return "Lỗi: Thông báo không tồn tại";
            }
            notification.IsShow = false;
            await _context.SaveChangesAsync();

            return "Ẩn thông báo thành công";
        }
        #endregion

        #region Update is read status 
        public async Task<bool> UpdateIsReadStatusAsync(List<int> notificationIds)
        {
            try
            {
                if (!notificationIds.Any())
                {
                    return true;
                }
                var notifications = await _context.Notifications
                           .Where(n => notificationIds.Contains(n.NotificationID))
                           .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        #endregion

        #region Create notification
        public async Task<string> CreateNotificationAsync(CreateNotificationDto notificationDto)
        {
            try
            {
                Notification notification;

                if (notificationDto.Type == "System")
                {
                    notification = new Notification
                    {
                        SenderId = notificationDto.SenderId,
                        ReceiverId = null,
                        Content = notificationDto.Content,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        Type = "System",
                        Link = notificationDto.Link,
                        IsShow = true
                    };
                    _context.Notifications.Add(notification);

                    await _hubContext.Clients.All.SendAsync("ReceiveSystemNotification", new
                    {
                        SenderId = notificationDto.SenderId,
                        Content = notificationDto.Content,
                        CreatedAt = DateTime.Now,
                        Type = "System",
                        Link = notificationDto.Link
                    });
                }
                else if (notificationDto.Type == "NewChapter")
                {
                    // Lấy danh sách user theo dõi truyện
                    var followers = await _context.Favorites
                        .Where(f => f.StoryID == notificationDto.TargetID)
                        .Select(f => f.UserID)
                        .ToListAsync();

                    if (!followers.Any())
                    {
                        return "Đăng tải thành công";
                    }

                    // Tạo thông báo cho từng user trong nhóm
                    foreach (var userId in followers)
                    {
                        notification = new Notification
                        {
                            SenderId = notificationDto.SenderId,
                            ReceiverId = userId,
                            Content = notificationDto.Content,
                            CreatedAt = DateTime.Now,
                            IsRead = false,
                            Type = notificationDto.Type,
                            Link = notificationDto.Link,
                            IsShow = true
                        };
                        _context.Notifications.Add(notification);

                        await _hubContext.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", new
                        {
                            SenderId = notificationDto.SenderId,
                            Content = notificationDto.Content,
                            CreatedAt = DateTime.Now,
                            Type = notificationDto.Type,
                            Link = notificationDto.Link
                        });
                    }
                }
                else if (notificationDto.Type == "ReportComment" || notificationDto.Type == "ReportStory")
                {
                    notification = new Notification
                    {
                        SenderId = notificationDto.SenderId,
                        ReceiverId = notificationDto.ReceiverId,
                        Content = notificationDto.Content,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        Type = notificationDto.Type,
                        Link = notificationDto.Link,
                        IsShow = true
                    };
                    _context.Notifications.Add(notification);

                    await _hubContext.Clients.Group(notificationDto.ReceiverId.ToString())
                        .SendAsync("ReceiveNotification", notification);
                }
                else
                {
                    return "Lỗi: Không có người nhận cho thông báo";
                }

                await _context.SaveChangesAsync();
                return "Tạo thông báo thành công";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
        }
        #endregion
    }
}
