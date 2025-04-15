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
    }
}
