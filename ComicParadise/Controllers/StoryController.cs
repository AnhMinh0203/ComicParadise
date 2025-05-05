using Amazon;
using Amazon.S3;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;

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
        public async Task<ActionResult> GetAllStory(int? userID, string? storyStatus)
        {
            var result = await _storyRepository.GetStoriesAsync(userID, storyStatus);
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
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }


        [HttpPost("Filter-story-by-conditions")]
        public async Task<ActionResult> FilterStoryByConditions(StoryFilterConditionsRequest storyFilterRequest)
        {
            var result = await _storyRepository.FilterStoryByConditionsAsync(storyFilterRequest);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpPost("Filter-story-by-categories")]
        public async Task<ActionResult> FilterStoryByCategories(List<int> categoryIds)
        {
            var result = await _storyRepository.FilterStoriesByCategoryIdsAsync(categoryIds);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpGet("Filter-story-by-category-name")]
        public async Task<ActionResult> FilterStoryByCategoryName(string categoryName)
        {
            var result = await _storyRepository.FilterStoriesByCategoryNameAsync(categoryName);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpGet("Get-current-update-story")]
        public async Task<ActionResult> GetCurrentUpdateStory(int days)
        {
            var result = await _storyRepository.GetCurrentUpdateStoriesAsync(days);
            return Ok(new BaseResponse<IEnumerable<dynamic>>(true, result));
        }

        [HttpGet("Get-top-story")]
        public async Task<ActionResult> GetTopStory(string topType)
        {
            var result = await _storyRepository.GetTopStoriesAsync(topType);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpGet("Get-advance-story")]
        public async Task<ActionResult> GetAdvanceStory(int userID)
        {
            var result = await _storyRepository.GetAdvanceStories(userID);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpPost("Like-story")]
        public async Task<ActionResult> LikeStory(int userID, int storyID)
        {
            var result = await _storyRepository.LikeStoryAsync(userID, storyID);
            return Ok(new BaseResponse<string>(true, result));
        }


        [HttpPost("Like-stories")]
        public async Task<ActionResult> LikeStories(LikeStoryRequest likeStoryRequest)
        {
            var result = await _storyRepository.LikeStoriesAsync(likeStoryRequest);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Check-is-liked")]
        public async Task<ActionResult> CheclkIsLiked(int userID, int storyID)
        {
            var result = await _storyRepository.CheckIsLikedAsync(userID, storyID);
            if (!result)
            {
                return Ok(new BaseResponse<bool>(false,result));

            }
            return Ok(new BaseResponse<bool>(true,result));
        }

        [HttpGet("Get-favorite-stories")]
        public async Task<ActionResult> GetFavoriteStories(int userID)
        {
            var result = await _storyRepository.GetFavoriteStoriesAsync(userID);
            return Ok(new BaseResponse<List<dynamic>>(true, result));
        }

        [HttpPost("Rating-story")]
        public async Task<ActionResult> RatingStory (RatingStoryDto ratingStoryDto)
        {
            var result = await _storyRepository.RatingStoryAsync(ratingStoryDto);
            return Ok(new BaseResponse<bool>(true,result));
        }

        [HttpGet("Get-user-rating")]
        public async Task<ActionResult> GetUserRating(int storyID, int userID)
        {
            var result = await _storyRepository.GetUserRating(storyID, userID);
            return Ok(new BaseResponse<int?>(true, result));
        }

        [HttpGet("Get-story-rating")]
        public async Task<ActionResult> GetStoryRating(int storyID)
        {
            var result = await _storyRepository.GetStoryRatingAsync(storyID);
            return Ok(new BaseResponse<int?>(true, result));
        }
    }
}
