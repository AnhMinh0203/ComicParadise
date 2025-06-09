using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class PasswordResetToken
    {
        public int UserID { get; set; }
        public string Token { get; set; } 
        public long TokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
