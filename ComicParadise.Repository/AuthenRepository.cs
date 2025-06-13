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
using Azure.Core;

namespace ComicParadise.Repository
{
    public class AuthenRepository : IAuthenRepository
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ITokenRepository _tokenResonse;

        public AuthenRepository(
            IConfiguration configuration,
            AppDbContext appDbContext,
            IEmailService emailService,
            ITokenRepository tokenRespon)
        {
            _configuration = configuration;
            _context = appDbContext;
            _emailService = emailService;
            _tokenResonse = tokenRespon;
        }

        #region Login - Done
        public async Task<BaseResponse_V2<AuthenResponse>> LoginAsync(SignInModel signInModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                    signInModel.Identifier.Contains("@") ? u.Email == signInModel.Identifier : u.Phone == signInModel.Identifier);

                if (user == null)
                {
                    return BaseResponse_V2<AuthenResponse>.NotFound("Email không tồn tại, vui lòng nhập chính xác");
                }

                if (!BCrypt.Net.BCrypt.Verify(signInModel.PasswordHash, user.PasswordHash))
                {
                    return BaseResponse_V2<AuthenResponse>.NotFound("Mật khẩu chưa đúng");
                }

                var accessToken = _tokenResonse.GenerateJwtToken(user);
                user.RefreshToken = Guid.NewGuid().ToString();
                user.ExpiryDate = DateTime.UtcNow.AddDays(7);

                await _context.SaveChangesAsync();
                return BaseResponse_V2<AuthenResponse>.Success("Đăng nhập thành công", new AuthenResponse
                {
         
                    AccessToken = accessToken,
                    User = new UserInfor
                    {
                        UserID = user.UserID,
                        Username = user.Username,
                        Avatar = user.Avatar,
                        Identifier = user.Email ?? user.Phone
                    }
                });
            }
            catch (Exception ex)
            {
                return BaseResponse_V2<AuthenResponse>.Fail(ex.Message);
            }
        }
        #endregion

        #region Refresh token - Done
        public async Task<BaseResponse_V2<string>> RefreshTokenAsync(string accessToken)
        {
            var userID = _tokenResonse.ValidateJwtToken(accessToken);
            if (userID == null)
            {
                return BaseResponse_V2<string>.Fail("Token không hợp lệ");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userID);

            if (user.ExpiryDate < DateTime.UtcNow)
            {
                return BaseResponse_V2<string>.Fail("Refresh token đã hết hạn");
            }

            var newAccessToken = _tokenResonse.GenerateJwtToken(user);
            return BaseResponse_V2<string>.Success("Refresh thành công", newAccessToken);
        }

        #endregion

        #region Register - Done
        public async Task<BaseResponse_V2<string>> RegisterAsync(RegisterModel registerModel)
        {
            var isExsistAccount = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerModel.Email || u.Phone == registerModel.Phone);
            if (isExsistAccount != null)
            {
                return BaseResponse_V2<string>.Fail("Người dùng đã tồn tại");
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

            return BaseResponse_V2<string>.Success("Tạo tài khoản thành công");
        }
        #endregion

        #region Request password reset - Done
        public async Task<BaseResponse_V2<string>> RequestPasswordResetAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return BaseResponse_V2<string>.NotFound("Email không tồn tại");

            var rawBytes = RandomNumberGenerator.GetBytes(64);
            var rawToken = Convert.ToBase64String(rawBytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", "");

            var hashedToken = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

            var expiry = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds();

            _context.PasswordResetTokens.RemoveRange(
                _context.PasswordResetTokens.Where(t => t.UserID == user.UserID));

            _context.PasswordResetTokens.Add(new PasswordResetToken
            {
                UserID = user.UserID,
                Token = hashedToken,
                TokenExpiry = expiry,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["App:FrontendUserUrls"];
            var resetLink = $"{frontendUrl}/reset-password?token={rawToken}";

            await _emailService.SendEmailAsync(email, "Khôi phục mật khẩu",
                $"Nhấn vào đây để đặt lại mật khẩu:\n\n{resetLink}");

            return BaseResponse_V2<string>.Success("Vui lòng kiểm tra email");
        }
        #endregion

        #region Reset password - Done
        public async Task<BaseResponse_V2<string>> ResetPasswordAsync(string rawToken, string newPassword)
        {
            string base64Token = rawToken.Replace("-", "+").Replace("_", "/");
            base64Token = base64Token.PadRight(base64Token.Length + (4 - base64Token.Length % 4) % 4, '=');

            var hashedToken = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

            var tokenEntry = await _context.PasswordResetTokens.FirstOrDefaultAsync(t => t.Token == hashedToken);
            if (tokenEntry == null || tokenEntry.TokenExpiry < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
                return BaseResponse_V2<string>.Fail("Token không hợp lệ hoặc đã hết hạn");

            var user = await _context.Users.FindAsync(tokenEntry.UserID);
            if (user == null)
                return BaseResponse_V2<string>.NotFound("Người dùng không tồn tại");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            _context.PasswordResetTokens.Remove(tokenEntry);
            await _context.SaveChangesAsync();

            return BaseResponse_V2<string>.Success("Đặt lại mật khẩu thành công!");
        }
        #endregion

        #region Change password - Done
        public async Task<BaseResponse_V2<string>> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == changePasswordDto.UserID);
                if (user == null)
                {
                    return BaseResponse_V2<string>.Fail("Người dùng đã tồn tại");
                }

                if (!IsPasswordValid(changePasswordDto.OldPassword, user.PasswordHash))
                {
                    return BaseResponse_V2<string>.Fail("Mật khẩu cũ không đúng");
                }

                string salt = BCrypt.Net.BCrypt.GenerateSalt();
                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword, salt);

                user.PasswordHash = newPasswordHash;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return BaseResponse_V2<string>.Success("Đổi mật khẩu thành công");
            }
            catch (Exception ex)
            {
                return BaseResponse_V2<string>.Fail("Đã xảy ra lỗi hệ thống");
            }
        }
        #endregion

        #region Login with Google 
        public async Task<BaseResponse_V2<AuthenResponse>> LoginWithGoogleAsync(string email, string name)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    Username = name,
                    Phone = "N/A",
                    PasswordHash = "",
                    Avatar = "",
                    RefreshToken = Guid.NewGuid().ToString(),
                    ExpiryDate = DateTime.UtcNow.AddDays(7),
                    CreatedAt = DateTime.UtcNow,
                    Role = "Reader",
                    Status = "Active",
                    IsComment = true,
                    IsLock = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                user.RefreshToken = Guid.NewGuid().ToString();
                user.ExpiryDate = DateTime.UtcNow.AddDays(7);
                await _context.SaveChangesAsync();
            }
            var accessToken = _tokenResonse.GenerateJwtToken(user);

            return BaseResponse_V2<AuthenResponse>.Success("Đăng nhập bằng Google thành công", new AuthenResponse
            {
                AccessToken = accessToken,
                User = new UserInfor
                {
                    UserID = user.UserID,
                    Username = user.Username,
                    Avatar = user.Avatar,
                    Identifier = user.Email,
                }

                
            });
        }
        #endregion

        #region Check valid password - Done
        private bool IsPasswordValid(string inputPassword, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        }
        #endregion

    }
}

