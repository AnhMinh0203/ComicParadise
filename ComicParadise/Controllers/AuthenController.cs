using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
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
    }
}
