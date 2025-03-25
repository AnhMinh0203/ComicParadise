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
        /* public override Task OnConnectedAsync()
         {
             Console.WriteLine("-----------------------");

            Console.WriteLine($"Client connected: {Context.ConnectionId}, UserID: {Context.UserIdentifier}");
             return base.OnConnectedAsync();
         }
         public async Task SendNotificationToUser(int receiverId, string message)
         {
             await Clients.User(receiverId.ToString()).SendAsync("ReceiveNotification", message);
         }

         public async Task SendNotificationToAll(string message)
         {
             await Clients.All.SendAsync("ReceiveNotification", message);
         }*/
        public async Task SendNotification(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }
    }
}
