using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<ActionResult<AuthenResponse>> Login(SignInModel signInModel)
        {
            var response = await _authenRepository.LoginAsync(signInModel);
            return Ok(response);

        }

        [HttpPost("Register")]
        public async Task<ActionResult> Register(RegisterModel register)
        {
            var response = await _authenRepository.RegisterAsync(register);
            return Ok(new BaseResponse<string>(true,response));
        }


        [HttpPost("Request-password-reset")]
        public async Task<ActionResult> RequestPasswordReset(string email)
        {
            var response = await _authenRepository.RequestPasswordResetAsync(email);
            return Ok(new BaseResponse<string>(true, response));
        }

        [HttpPost("Reset-password")]
        public async Task<ActionResult> ResetPassword(string rawToken, string newPassword)
        {
            var response = await _authenRepository.ResetPasswordAsync(rawToken, newPassword);
            return Ok(new BaseResponse<string>(true, response));
        }
    }
}
