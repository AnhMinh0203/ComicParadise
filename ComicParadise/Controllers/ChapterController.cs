using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChapterController : ControllerBase
    {
        private readonly IChapterRepository _chapterRepository;
        public ChapterController(IChapterRepository chapterRepository)
        {
            _chapterRepository = chapterRepository;
        }

        [HttpGet("Get-next-chapter-number")]
        public async Task<ActionResult> GetNextChapterNumber(int storyID)
        {
            var result = await _chapterRepository.GetNextChapterNumberAsync(storyID);
            return Ok(new BaseResponse<int>(true, result));
        }

        [HttpPost("Post-chapter")]
        public async Task<ActionResult>  PostChapter (PostChapterDto postChapterDto)
        {
            var result = await _chapterRepository.PostChapterAsync(postChapterDto);
            return Ok(new BaseResponse_V2<string>(true,200,result,null));
        }

        [HttpGet("Get-chapter-content")]
        public async Task<ActionResult> GetChapterContent (int storyID, int chapterNumber, int? userID)
        {
            var result = await _chapterRepository.GetChapterContentAsync(storyID, chapterNumber, userID);
            return Ok(new BaseResponse<ChapterContentDto>(true, result));
        }


        [HttpGet("Get-chapters-by-storyID")]
        public async Task<ActionResult> GetChaptersByStoryID(int storyID)
        {
            var result = await _chapterRepository.GetChaptersByStoryIDAsync(storyID);
            return Ok(new BaseResponse<List<Chapter>>(true, result));
        }

        [HttpDelete("Delete-chapter-page")]
        public async Task<ActionResult> DeleteChapterPage(int storyID, int chapterNumber, int chapterPage)
        {
            var result = await _chapterRepository.DeleteChapterPageAsync(storyID, chapterNumber, chapterPage);
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpPost("Replace-chapter-page")]
        public async Task<ActionResult> ReplaceChapterPage(ChapterPageRequest request)
        {
            var result = await _chapterRepository.ReplaceChapterPageAsync(request);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpPost("Add-chapter-page")]
        public async Task<ActionResult> AddChapterPage(ChapterPageRequest request)
        {
            var result = await _chapterRepository.AddChapterPageAsync(request);
            return Ok(new BaseResponse<string>(true, result));
        }


        [HttpPost("Mark-chapter")]
        public async Task<ActionResult> MarkChapter(MarkChapterDto markChapterDto)
        {
            var result = await _chapterRepository.ToggleChapterBookmarkAsync(markChapterDto);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpPost("Is-bookmarked")]
        public async Task<ActionResult> IsBookmarked(MarkChapterDto markChapterDto)
        {
            var result = await _chapterRepository.IsChapterBookmarkedAsync(markChapterDto);
            return Ok(new BaseResponse<bool>(true, result));
        }

        [HttpGet("Get-mark-chapter")]
        public async Task<ActionResult> GetMarkChapter(  int userID ,int storyID)
        {
            var result = await _chapterRepository.GetMarkChapterAsync(userID, storyID);
            return Ok(new BaseResponse<ChapterLinkDto>(true, result));
        }

        [HttpGet("Get-chapter-list")]
        public async Task<ActionResult> GetChapterList(int storyID)
        {
            var result = await _chapterRepository.GetAllChapterListAsync( storyID);
            return Ok(new BaseResponse<List<int>>(true, result));
        }
    }
}
