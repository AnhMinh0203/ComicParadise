using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenController : ControllerBase
    {
        IAuthenRepository _authenRepository;
        IConfiguration _configuration;
        public AuthenController(IAuthenRepository authenRepository, IConfiguration configuration)
        {
            _authenRepository = authenRepository;
            _configuration = configuration;
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login(SignInModel signInModel)
        {
            var response = await _authenRepository.LoginAsync(signInModel);
            return Ok(response);
        }

        [HttpPost("Register")]
        public async Task<ActionResult> Register(RegisterModel register)
        {
            var response = await _authenRepository.RegisterAsync(register);
            return Ok(response);
        }


        [HttpPost("Request-password-reset")]
        public async Task<ActionResult> RequestPasswordReset(string email)
        {
            var response = await _authenRepository.RequestPasswordResetAsync(email);
            return Ok(response);
        }

        [HttpPost("Reset-password")]
        public async Task<ActionResult> ResetPassword(string rawToken, string newPassword)
        {
            var response = await _authenRepository.ResetPasswordAsync(rawToken, newPassword);
            return Ok(response);
        }

        [Authorize]
        [HttpPost("Change-password")]
        public async Task<ActionResult<BaseResponse_V2<string>>> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var response = await _authenRepository.ChangePasswordAsync(changePasswordDto);
            return Ok(response);
        }

        [HttpPost("Refresh-token")]
        public async Task<ActionResult<AuthenResponse>> RefreshToken(string accessToken)
        {
            var response = await _authenRepository.RefreshTokenAsync(accessToken);
            return Ok(response);
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "/api/Authen/external-login-callback" 
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }



        [HttpGet("external-login-callback")]
        public async Task<IActionResult> ExternalLoginCallback()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!result.Succeeded || result.Principal == null)
                return BadRequest("Google login failed.");

            var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
                return BadRequest("Email không lấy được từ Google");

            var loginResult = await _authenRepository.LoginWithGoogleAsync(email, name);
            var ridirectUrl = _configuration["App:FrontendUserUrls"];
            return Redirect($"{ridirectUrl}/login-google-success?token={loginResult.Data.AccessToken}");
        }
    }
}
