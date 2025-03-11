using ComicParadise.DataContext.Dto;
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
        Task<List<StoryInfor>> GetStoriesAsync();
        Task<string> UpdateStatusAsync(string status, int storyID);
        Task<StoryDetail> GetStoryByIdAsync(int storyID);
        Task<string> UpdateStoryAsync(UpdateStoryDto storyDto);
    }
}
