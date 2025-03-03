using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly IMemberRepository _memberRepository; 
        public MemberController(IMemberRepository memberRepository)
        {
            _memberRepository = memberRepository;
        }
        [HttpGet("get-all-members")]
        public async Task<ActionResult> GetAllMembers()
        {
            var result = await _memberRepository.GetAllMembersAsync();
            return Ok(result);
        }

/*        [HttpGet("get-specify-member")]
        public async Task<ActionResult<UserAuthen>> GetSpecifyMember()
        {
            var result = await _memberRepository.GetSpesifycMemberAsync();
            return result;

        }*/
    }
}
