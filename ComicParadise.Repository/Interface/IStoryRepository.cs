using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface IStoryRepository
    {
        Task<string> AddStoryAsync(AddStoryDto createStoryDto);
        Task<List<StoryInfor>> GetStoriesAsync(int? userID, string? storyStatus);
        Task<string> UpdateStatusAsync(string status, int storyID);
        Task<StoryDetail> GetStoryByIdAsync(int storyID);
        Task<string> UpdateStoryAsync(UpdateStoryDto storyDto);
        Task<string> DeleteStoryAsync(int storyID);
        Task<List<dynamic>> SearchStoryAsync(string title);
        Task<PagedResult<CurrentUpdateStoryDto>> GetCurrentUpdateStoriesAsync(int days, int pageIndex, int pageSize);
        Task<PagedResult<TopStoryDto>> GetTopStoriesAsync(string topType, int pageIndex, int pageSize);
        Task<PagedResult<AdvanceStoryDto>> GetAdvanceStories(int? userID, int pageIndex, int pageSize);
        Task<string> LikeStoryAsync(int userID, int storyID);
        Task<bool> CheckIsLikedAsync(int userID, int storyID);
        Task<List<dynamic>> GetFavoriteStoriesAsync(int userID);
        Task<string> LikeStoriesAsync(LikeStoryRequest likeStoryRequest);
        Task<bool> RatingStoryAsync(RatingStoryDto ratingStoryDto);
        Task<int?> GetUserRating(int storyID, int userID);
        Task<int?> GetStoryRatingAsync(int storyID);
        Task<List<dynamic>> FilterStoryByConditionsAsync(StoryFilterConditionsRequest filter);
        Task<List<dynamic>> FilterStoriesByCategoryIdsAsync(List<int> categoryIds);
        Task<List<dynamic>> FilterStoriesByCategoryNameAsync(string categoryName);
        Task<PagedResult<StoryDto>> GetNovelStories(int pageIndex, int pageSize);
    }
}
