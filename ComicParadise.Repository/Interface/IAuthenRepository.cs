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
        Task<BaseResponse_V2<AuthenResponse>> LoginAsync(SignInModel signInModel);
        Task<BaseResponse_V2<string>> RefreshTokenAsync(string accessToken);
        Task<BaseResponse_V2<string>> RegisterAsync(RegisterModel registerModel);
        Task<BaseResponse_V2<string>> RequestPasswordResetAsync(string email);
        Task<BaseResponse_V2<string>> ResetPasswordAsync(string rawToken, string newPassword);
        Task<BaseResponse_V2<string>> ChangePasswordAsync(ChangePasswordDto changePasswordDto);
        Task<BaseResponse_V2<AuthenResponse>> LoginWithGoogleAsync(string email, string name);

    }
}
