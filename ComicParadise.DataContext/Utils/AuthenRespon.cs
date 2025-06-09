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
        public string AccessToken { get; set; }
        public UserInfor User { get; set; }
    }
}
