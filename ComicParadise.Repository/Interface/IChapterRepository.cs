using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface IChapterRepository
    {
        Task<int> GetNextChapterNumberAsync(int storyID);
        Task<string> PostChapterAsync(PostChapterDto chapterDto);
        Task<ChapterContentDto?> GetChapterContentAsync(int storyID, int chapterNumber, int? userID);
        Task<List<Chapter>> GetChaptersByStoryIDAsync(int storyID);
        Task<string> GetChapterPageByPageNumberAsync(int storyID, int chapterID, int pageNumber);
        Task<string> DeleteChapterPageAsync(int storyID, int chapterNumber, int chapterPage);
        Task<string> ReplaceChapterPageAsync(ChapterPageRequest request);
        Task<string> AddChapterPageAsync(ChapterPageRequest request);
        Task<string> ToggleChapterBookmarkAsync(MarkChapterDto markChapterDto);
        Task<bool> IsChapterBookmarkedAsync(MarkChapterDto markChapterDto);
        Task<ChapterLinkDto> GetMarkChapterAsync(int userID, int storyID);
    }
}
