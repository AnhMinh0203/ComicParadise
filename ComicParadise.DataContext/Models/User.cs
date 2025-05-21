using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? Avatar {  get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool? IsComment { get; set; } = true;
        public bool? IsLock { get; set; } = false;
        public DateTime CreatedAt { get; set; }

    }
}
