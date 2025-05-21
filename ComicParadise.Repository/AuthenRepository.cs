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
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;
using System.Security.Cryptography;
using System.Net;
using ComicParadise.Repository.Interface;

namespace ComicParadise.Repository
{
    public class AuthenRepository : IAuthenRepository
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public AuthenRepository(IConfiguration configuration, AppDbContext appDbContext, IEmailService emailService)
        {
            _configuration = configuration;
            _context = appDbContext;
            _emailService = emailService;
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
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Phone == signInModel.Identifier || u.Email == signInModel.Identifier);

                if (user == null)
                {
                    return new AuthenResponse
                    {
                        Message = "Người dùng không tồn tại.",
                        Status = 404
                    };
                }

                if (!BCrypt.Net.BCrypt.Verify(signInModel.PasswordHash, user.PasswordHash))
                {
                    return new AuthenResponse
                    {
                        Message = "Mật khẩu chưa đúng",
                        Status = 401
                    };
                }

                // Tạo access token
                var tokenRespon = new TokenRespon(_configuration);
                var accessToken = tokenRespon.GenerateJwtToken(user);

                // Tạo refresh token
                user.RefreshToken = Guid.NewGuid().ToString();
                user.ExpiryDate = DateTime.UtcNow.AddDays(7);

                await _context.SaveChangesAsync();

                return new AuthenResponse
                {
                    Message = "Login Successfully",
                    Token = accessToken,
                    RefreshToken = user.RefreshToken,
                    Status = 200,
                    User = new UserInfor
                    {
                        UserID = user.UserID,
                        Username = user.Username,
                        Avatar = user.Avatar,
                        Identifier = user.Email ?? user.Phone
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthenResponse
                {
                    Message = $"Lỗi hệ thống: {ex.Message}",
                    Status = 500
                };
            }
        }
        #endregion

        #region Refresh token
        public async Task<AuthenResponse> RefreshTokenAsync(string refreshToken)
        {
            var Test = refreshToken;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null)
            {
                return new AuthenResponse
                {
                    Message = "Refresh token không hợp lệ.",
                    Status = 401
                };
            }

            if (user.ExpiryDate < DateTime.UtcNow)
            {
                return new AuthenResponse
                {
                    Message = "Refresh token đã hết hạn.",
                    Status = 403
                };
            }

            // Tạo access token mới
            var tokenRespon = new TokenRespon(_configuration);
            var newAccessToken = tokenRespon.GenerateJwtToken(user);

            // Nếu muốn xoay vòng refresh token
            user.RefreshToken = Guid.NewGuid().ToString();
            user.ExpiryDate = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            return new AuthenResponse
            {
                Message = "Refresh thành công",
                Token = newAccessToken,
                RefreshToken = user.RefreshToken,
                Status = 200,
                User = new UserInfor
                {
                    UserID = user.UserID,
                    Username = user.Username,
                    Avatar = user.Avatar,
                    Identifier = user.Email ?? user.Phone
                }
            };
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
        #endregion

        #region Request password reset
        public async Task<string> RequestPasswordResetAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // Tạo phản hồi giả dù user không tồn tại
            if (user == null)
            {
                await Task.Delay(500); // tránh timing attack
                return "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn qua email.";
            }

            // Tạo token ngẫu nhiên
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            // Hash token (SHA-256)
            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToHexString(sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken)));

            // Tính thời gian hết hạn (ví dụ: 30 phút)
            var expiry = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds();

            // Lưu vào bảng token
            var resetToken = new PasswordResetToken
            {
                UserID = user.UserID,
                Token = hashedToken,
                TokenExpiry = expiry
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();


            // Tạo link gửi cho người dùng
            var resetLink = $"http://localhost:4200/reset-password?token={WebUtility.UrlEncode(rawToken)}";

            await _emailService.SendEmailAsync(email, "Khôi phục mật khẩu",
                $"Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:\n\n{resetLink}");

            return "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn qua email.";
        }
        #endregion

        #region Reset password
        public async Task<string> ResetPasswordAsync(string rawToken, string newPassword)
        {
            // Hash lại token để so sánh
            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToHexString(sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken)));
            Console.WriteLine(hashedToken.GetType());

            var tokenEntry = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == hashedToken);

            if (tokenEntry == null || tokenEntry.TokenExpiry < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return "Mã đặt lại không hợp lệ hoặc đã hết hạn.";
            }

            var user = await _context.Users.FindAsync(tokenEntry.UserID);
            if (user == null) return "Người dùng không tồn tại.";

            // Hash mật khẩu mới (ví dụ dùng BCrypt)
            string salt = BCrypt.Net.BCrypt.GenerateSalt();
            string hash = BCrypt.Net.BCrypt.HashPassword(newPassword, salt);
            user.PasswordHash = hash;

            // Xóa token sau khi dùng
            _context.PasswordResetTokens.Remove(tokenEntry);
            await _context.SaveChangesAsync();

            return "Đặt lại mật khẩu thành công!";
        }
        #endregion

        #region Change password
        public async Task<string> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
        {
            // Kiểm tra tính hợp lệ của dữ liệu đầu vào
            if (changePasswordDto == null ||
                string.IsNullOrWhiteSpace(changePasswordDto.OldPassword) ||
                string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
            {
                return "Vui lòng nhập đầy đủ thông tin";
            }

            try
            {
                // Lấy thông tin người dùng từ cơ sở dữ liệu bằng UserID
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == changePasswordDto.UserID);
                if (user == null)
                {
                    return "Người dùng không tồn tại";
                }

                // Kiểm tra mật khẩu cũ
                if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.OldPassword, user.PasswordHash))
                {
                    return "Mật khẩu cũ không đúng";
                }
                // Mã hóa mật khẩu mới
                string salt = BCrypt.Net.BCrypt.GenerateSalt();
                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword, salt);

                // Cập nhật mật khẩu mới trong cơ sở dữ liệu
                user.PasswordHash = newPasswordHash;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return "Đổi mật khẩu thành công";
            }
            catch (Exception ex)
            {
                return $"Lỗi: {ex.Message}";
            }
        }
        #endregion

    }

}

