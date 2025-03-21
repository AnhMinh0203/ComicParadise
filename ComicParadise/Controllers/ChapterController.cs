using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
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
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpGet("Get-chapter-content")]
        public async Task<ActionResult> GetChapterContent (int storyID, int chapterNumber, int userID)
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


        /*        [HttpGet("Get-chapter-page-by-page-number")]
                public async Task<ActionResult> GetChapterPageByPageNumber(int storyID, int chapterID, int pageNumber)
                {
                    var result = await _chapterRepository.GetChapterPageByPageNumberAsync(storyID, chapterID,pageNumber);
                    return Ok(new BaseResponse<string>(true, result));
                }*/
    }
}
