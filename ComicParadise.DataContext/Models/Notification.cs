using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Notification
    {
        public int NotificationID { get; set; } 
        public int SenderId { get; set; } 
        public int? ReceiverId { get; set; } 
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false; 
        public bool IsShow { get; set; } = true;
        public string Type { get; set; }
        public string? Link { get; set; } 
    }
}
