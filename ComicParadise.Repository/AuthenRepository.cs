using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using ComicParadise.Repository;
using ComicParadise.DataContext.Dto;

namespace ComicParadise.Repository
{
    public class AuthenRepository : IAuthenRepository
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthenRepository(IConfiguration configuration, AppDbContext appDbContext)
        {
            _configuration = configuration;
            _context = appDbContext;
        }

        #region Login 
        public async Task<AuthenResponse> LoginAsync(SignInModel signInModel)
        {
            if (signInModel == null ||
                string.IsNullOrWhiteSpace(signInModel.Identifier) ||
                string.IsNullOrWhiteSpace(signInModel.PasswordHash))
            {
                return new AuthenResponse
                {
                    Message = "Vui lòng nhập đủ thông tin",
                    Status = 400
                };
            }
            try
            {
                UserAuthen? userAuthen = new UserAuthen();

                if (Regex.IsMatch(signInModel.Identifier, @"^\d+$"))
                {
                    userAuthen = await _context.Users
                        .Where(u => u.Phone == signInModel.Identifier)
                        .Select(u => new UserAuthen
                        {
                            UserId = u.UserID,
                            FullName = u.Username,
                            Identifier = u.Phone,
                            PasswordHash = u.PasswordHash,
                        })
                        .FirstOrDefaultAsync();
                }
                else
                {
                    userAuthen = await _context.Users
                        .Where(u => u.Email == signInModel.Identifier)
                        .Select(u => new UserAuthen
                        {
                            UserId = u.UserID,
                            FullName = u.Username,
                            Identifier = u.Email,
                            PasswordHash = u.PasswordHash,
                        })
                        .FirstOrDefaultAsync();

                }

                if (userAuthen == null)
                {
                    return new AuthenResponse
                    {
                        Message = "Người dùng không tồn tại.",
                        Status = 404
                    };
                }

                // Check pass
                if (!BCrypt.Net.BCrypt.Verify(signInModel.PasswordHash, userAuthen.PasswordHash))
                {
                    return new AuthenResponse
                    {
                        Message = "Mật khẩu chưa đúng",
                        Token = null,
                        Status = 401
                    };
                }

                var tokenRespon = new TokenRespon(_configuration);
                var token = tokenRespon.GenerateJwtToken(userAuthen, userAuthen.UserId);
                UserInfor userInfor = new UserInfor
                {
                    UserID = userAuthen.UserId,
                    Username = userAuthen.FullName,
                    Identifier = userAuthen.Identifier,

                };

                return new AuthenResponse
                {
                    Message = "Login Successfully",
                    Token = token,
                    Status = 200,
                    User = userInfor
                };
            }
            catch (Exception ex)
            {
                return new AuthenResponse
                {
                    Message = $"SQL Error: {ex.Message}",
                    Token = null,
                    Status = 500
                };
            }
        }
        #endregion

        #region Register
        public async Task<string> RegisterAsync(RegisterModel registerModel)
        {
            try
            {
                var isExsistAccount = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerModel.Email || u.Phone == registerModel.Phone);
                 if (isExsistAccount != null)
                {
                    return "Người dùng đã tồn tại";
                };
                string salt = BCrypt.Net.BCrypt.GenerateSalt();
                string hash = BCrypt.Net.BCrypt.HashPassword(registerModel.PasswordHash, salt);

                var newUser = new User
                {
                    Username = registerModel.Username,
                    Email = registerModel.Email,
                    Phone = registerModel.Phone,
                    PasswordHash = hash,
                    Role = registerModel.Role,
                    Status = "Active",
                    Avatar = null,
                    IsComment = true,
                    IsLock = false,
                    CreatedAt = DateTime.Now,
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return "Tạo tài khoản thành công";
            }
            catch (Exception ex)
            {
                throw;
            }


        }

    }
    #endregion
}

