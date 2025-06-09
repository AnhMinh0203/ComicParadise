using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface ITokenRepository
    {
        string GenerateJwtToken(User user);
        int? ValidateJwtToken(string? token);
    }
}
