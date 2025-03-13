using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class AddMemberDto
    {
        public string? Username { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public IFormFile? Avatar { get; set; }
        public bool? IsComment { get; set; } = true;

        public bool? IsLock { get; set; } = false;
    }

    public class UpdateMemberDto: AddMemberDto
    {
        public int UserID { get; set; }
    }

}
