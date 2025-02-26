using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Utils
{
    public class SignInModel
    {
        public string? Identifier { get; set; }
        public string? PasswordHash { get; set; }
    }
}
