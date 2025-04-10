using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class NotificationHub: Hub
    {
        public async Task RegisterUser(string userId)
        {
            // Đăng ký client vào nhóm dựa trên userId 
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        public async Task SendSystemNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveSystemNotification", message);
        }

/*        // Đăng ký user vào nhóm theo dõi truyện
        public async Task FollowStory(string userId, int storyId)
        {
            var groupName = $"story_{storyId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        // Hủy theo dõi truyện
        public async Task UnfollowStory(string userId, int storyId)
        {
            var groupName = $"story_{storyId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }*/
    }
}
