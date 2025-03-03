using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class MemberRepository : IMemberRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public MemberRepository(AppDbContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
        }

        public async Task<List<UserAuthen>> GetAllMembersAsync()
        {
            List<UserAuthen> users = await _context.Users
               /* .Where(x => x.Role == "Admin")*/
                .Select(x => new UserAuthen
                {
                    FullName = x.Username,
                    Identifier = x.Email,
                    PasswordHash = x.PasswordHash,
                }).ToListAsync();

            return users;
        }

 /*       public async Task<UserAuthen> GetSpesifycMemberAsync()
        {
            UserAuthen user = await _context.Users
                 .Where(x => x.Role == "Reader")
                .Select(x => new UserAuthen
                {
                    FullName = x.Username,
                    Identifier = x.Email,
                    PasswordHash = x.PasswordHash,
                }).FirstOrDefaultAsync();

            return user;
        }*/

    }
}
