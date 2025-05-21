using ComicParadise.DataContext.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Utils
{
    public class AuthenResponse
    {
        public string? Message { get; set; }
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public int? Status { get; set; }
        public UserInfor User { get; set; }
    }
}
