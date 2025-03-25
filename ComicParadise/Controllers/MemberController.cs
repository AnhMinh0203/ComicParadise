using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
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

        [HttpGet("Get-all-members")]
        public async Task<ActionResult> GetAllMembers()
        {
            var result = await _memberRepository.GetAllMembersAsync();
            return Ok(result);
        }

        [HttpPost("Add-member")]
        public async Task<ActionResult> AddMember(AddMemberDto addMemberDto)
        {
            var result = await _memberRepository.AddMemberAsync(addMemberDto);
            if (result.Contains("Lỗi"))
            {
                return Ok(new BaseResponse<string>(false, result));

            }
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpGet("Export-excel-member")]
        public async Task<ActionResult> ExportExcel()
        {
            var result = await _memberRepository.ExportExcelAsync();
            string fileName = $"UsersReport-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(result, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpPost("Update-member")]
        public async Task<ActionResult> UpdateMember(UpdateMemberDto updateMemberDto)
        {
            var result = await _memberRepository.UpdateMemberAsync(updateMemberDto);
            if (result.Contains("Lỗi"))
            {
                return Ok(new BaseResponse<string>(false, result));

            }
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Get-reading-histories")]
        public async Task<ActionResult> GetReadingHistory (int userID)
        {
            var result = await _memberRepository.GetReadingHistoryAsync(userID);
            return Ok(new BaseResponse<IQueryable<ReadingHistoryDto>>(true,result));
        }
        [HttpDelete("Delete-member")]
        public async Task<ActionResult> DeleteMember(int userID)
        {
            var result = await _memberRepository.DeleteMemberAsync(userID);
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpGet("Get-member-by-id")]
        public async Task<ActionResult> GetMemebrById(int userID)
        {
            var result = await _memberRepository.GetMemberById(userID);
            return Ok(new BaseResponse<User>(true, result));
        }
    }
}
