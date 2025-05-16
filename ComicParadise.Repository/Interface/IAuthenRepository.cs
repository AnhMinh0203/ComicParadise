using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface IAuthenRepository
    {
        Task<AuthenResponse> LoginAsync(SignInModel signInModel);
        Task<string> RegisterAsync(RegisterModel registerModel);
        Task<string> RequestPasswordResetAsync(string email);
        Task<string> ResetPasswordAsync(string rawToken, string newPassword);
        Task<string> ChangePasswordAsync(ChangePasswordDto changePasswordDto);
    }
}
