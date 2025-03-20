using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoryController : ControllerBase
    {
        private readonly IStoryRepository _storyRepository;
        public StoryController(IStoryRepository storyRepository)
        {
            _storyRepository = storyRepository;
        }

        [HttpPost("Add-story")]
        public async Task<ActionResult> AddStory (AddStoryDto dto)
        {
            var result = await _storyRepository.AddStoryAsync(dto);
            return Ok(new BaseResponse<string> (true, result));
        }
        [HttpGet("Get-all-stories")]
        public async Task<ActionResult> GetAllStory()
        {
            var result = await _storyRepository.GetStoriesAsync();
            return Ok(new BaseResponse<List<StoryInfor>>(true, result));
        }

        [HttpPost("Update-status")]
        public async Task<ActionResult> UpdateStatus(string status, int storyID)
        {
            var result = await _storyRepository.UpdateStatusAsync(status, storyID);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Get-story-by-id")]
        public async Task<ActionResult> GetStoryById (int storyID)
        {
            var result = await _storyRepository.GetStoryByIdAsync(storyID);
            return Ok(new BaseResponse<StoryDetail>(true,result));  
        }

        [HttpPost("Update-story")]
        public async Task<ActionResult> UpdateStory(UpdateStoryDto updateStoryDto)
        {
            var result = await _storyRepository.UpdateStoryAsync(updateStoryDto);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpDelete("Delete-story")]
        public async Task<ActionResult> DeleteStory(int storyID)
        {
            var result = await _storyRepository.DeleteStoryAsync(storyID);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Search-stories")]
        public async Task<ActionResult> SearchStory(string title)
        {
            var result = await _storyRepository.SearchStoryAsync(title);
            return Ok(new BaseResponse<List<StoryInfor>>(true, result));
        }

        [HttpGet("Get-current-update-story")]
        public async Task<ActionResult> GetCurrentUpdateStory(int days)
        {
            var result = await _storyRepository.GetCurrentUpdateStoriesAsync(days);
            return Ok(new BaseResponse<IEnumerable<dynamic>>(true, result));
        }
    }
}
