using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Collections;

namespace ComicParadise.Repository
{
    public class StoryRepository : IStoryRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly string? _containerCoverImg;
        private readonly BlobServiceClient _blobServiceClient;
        public StoryRepository(AppDbContext context, IConfiguration config, BlobServiceClient blobServiceClient)
        {
            _context = context;
            _config = config;
            _blobServiceClient = blobServiceClient;
            _containerCoverImg = _config["ContainerCoverImg"];
        }

        #region Add story
        public async Task<string> AddStoryAsync(AddStoryDto createStoryDto)
        {
            try
            {
                var publisher = await _context.Users.FindAsync(createStoryDto.PublisherID);
                if (publisher == null)
                {
                    return "Lỗi: Nhà xuất bản không tồn tại";
                }
                var status = (publisher.Role == "Admin") ? "Approved" : "Pending";

                // Đẩy ảnh bìa lên clound
                var containerCoverImg = _blobServiceClient.GetBlobContainerClient(_containerCoverImg);
                string primaryImgUrl = await UploadFileToAzure(createStoryDto.CoverImage, containerCoverImg);

                var newStory = new Story
                {
                    Title = createStoryDto.Title,
                    Author = createStoryDto.Author,
                    Type = createStoryDto.Type,
                    Status = status,
                    PublisherID = createStoryDto.PublisherID,
                    CoverImage = primaryImgUrl,
                    Description = createStoryDto.Description,
                };

                _context.Stories.Add(newStory);
                await _context.SaveChangesAsync();

                var storyCategories = createStoryDto.CategoryIDs.Select(categoryId => new StoryCategoriesMapping
                {
                    StoryID = newStory.StoryID,
                    CategoryID = categoryId
                }).ToList();

                _context.StoryCategoriesMapping.AddRange(storyCategories);
                await _context.SaveChangesAsync();

                return "Thêm truyện thành công !";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (Azure.RequestFailedException azEx)
            {
                return $"Lỗi upload ảnh lên cloud: {azEx.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }

        }
        #endregion

        #region Upload file to Azure
        private async Task<string> UploadFileToAzure(IFormFile imgFile, BlobContainerClient containerClient)
        {
            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(imgFile.FileName);
            var blobClient = containerClient.GetBlobClient(fileName);

            using (var stream = imgFile.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = imgFile.ContentType });

            }
            return blobClient.Uri.ToString();
        }
        #endregion

        #region Get stories
        public async Task<List<StoryInfor>> GetStoriesAsync()
        {
            try
            {
                List<StoryInfor> listStories = await (from s in _context.Stories
                                                      join u in _context.Users on s.PublisherID equals u.UserID
                                                      join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                      select new StoryInfor
                                                      {
                                                          StoryID = s.StoryID,
                                                          Title = s.Title,
                                                          CoverImage = s.CoverImage,
                                                          Status = s.Status,
                                                          PublisherName = u.Username,
                                                          TotalChapter = chapters.Count()
                                                      })
                                         .ToListAsync();
                return listStories;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region Update status 
        public async Task<string> UpdateStatusAsync(string status, int storyID)
        {
            var story = await _context.Stories
                        .Where(s => s.StoryID == storyID)
                        .FirstOrDefaultAsync();
            if (story == null)
            {
                return "Không tìm thấy truyện";
            }



            story.Status = status;
            _context.SaveChanges();
            return "Cập nhật trạng thái thành công !";
        }
        #endregion

        #region Get story by ID
        public async Task<StoryDetail> GetStoryByIdAsync(int storyID)
        {
            var storyDetail = await (from s in _context.Stories
                                     where s.StoryID == storyID
                                     join u in _context.Users on s.PublisherID equals u.UserID
                                     select new StoryDetail
                                     {
                                         StoryID = s.StoryID,
                                         Title = s.Title,
                                         Author = s.Author,
                                         Type = s.Type,
                                         Description = s.Description,
                                         CoverImage = s.CoverImage,
                                         Categories = (from sc in _context.StoryCategoriesMapping
                                                       join c in _context.Categories on sc.CategoryID equals c.CategoryID
                                                       where sc.StoryID == storyID
                                                       select c).ToList(),
                                     })
                                     .FirstOrDefaultAsync();

            if (storyDetail == null)
            {
                throw new Exception($"Không tìm thấy truyện với StoryID {storyID}");
            }
            if (storyDetail.comments != null && storyDetail.comments.Any())
            {
                storyDetail.comments = BuildCommentTree(storyDetail.comments);
            }

            return storyDetail;
        }

        private List<CommentDto> BuildCommentTree(List<CommentDto> comments)
        {
            var commentMap = comments.ToDictionary(c => c.CommentID, c => c);
            var rootComments = new List<CommentDto>();

            foreach (var comment in comments)
            {
                if (comment.Reply == null)
                {
                    // Nếu không có reply, đây là comment gốc
                    rootComments.Add(comment);
                }
                else if (commentMap.ContainsKey(comment.Reply.Value))
                {
                    // Nếu có reply và comment cha tồn tại, thêm vào danh sách con của comment cha
                    var parentComment = commentMap[comment.Reply.Value];
                    parentComment.ChildComments.Add(comment);
                }
                else
                {
                    // Nếu reply trỏ đến comment không tồn tại trong danh sách, thêm vào rootComments
                    rootComments.Add(comment);
                }
            }

            // Sắp xếp comment gốc theo thời gian giảm dần (mới nhất trước)
            rootComments.Sort((a, b) => b.CreatedAt.CompareTo(a.CreatedAt));
            foreach (var comment in rootComments)
            {
                SortChildComments(comment);
            }

            return rootComments;
        }

        private void SortChildComments(CommentDto comment)
        {
            if (comment.ChildComments != null && comment.ChildComments.Any())
            {
                comment.ChildComments.Sort((a, b) => a.CreatedAt.CompareTo(b.CreatedAt));
                foreach (var child in comment.ChildComments)
                {
                    SortChildComments(child);
                }
            }
        }

        #endregion

        #region Update story infor
        public async Task<string> UpdateStoryAsync(UpdateStoryDto storyDto)
        {
            try
            {
                var story = await _context.Stories
                                .FirstOrDefaultAsync(s => s.StoryID == storyDto.StoryID);

                if (story == null)
                {
                    throw new Exception("Truyện không tồn tại");
                }

                if (!string.IsNullOrEmpty(storyDto.Title) && story.Title != storyDto.Title)
                {
                    story.Title = storyDto.Title;
                }
                if (!string.IsNullOrEmpty(storyDto.Author) && story.Author != storyDto.Author)
                {
                    story.Author = storyDto.Author;
                }
                if (!string.IsNullOrEmpty(storyDto.Type) && story.Type != storyDto.Type)
                {
                    story.Type = storyDto.Type;
                }
                if (!string.IsNullOrEmpty(storyDto.Description) && story.Description != storyDto.Description)
                {
                    story.Description = storyDto.Description;
                }


                if (storyDto.CoverImage != null && storyDto.CoverImage.Length > 0)
                {
                    // Xóa ảnh bìa cũ trên Azure Blob Storage (nếu có)
                    var containerCoverImg = _blobServiceClient.GetBlobContainerClient(_containerCoverImg);
                    if (!string.IsNullOrEmpty(story.CoverImage))
                    {
                        string oldBlobName = new Uri(story.CoverImage).AbsolutePath.Substring(1);
                        var oldBlobClient = containerCoverImg.GetBlobClient(oldBlobName);
                        await oldBlobClient.DeleteIfExistsAsync();
                    }

                    // Tải ảnh bìa mới lên
                    string newCoverImageUrl = await UploadFileToAzure(storyDto.CoverImage, containerCoverImg);
                    story.CoverImage = newCoverImageUrl;
                }

                if (storyDto.CategoryIDs != null && storyDto.CategoryIDs.Any())
                {
                    // Xóa các mapping cũ
                    var existingCategories = await _context.StoryCategoriesMapping
                        .Where(sc => sc.StoryID == story.StoryID)
                        .ToListAsync();
                    _context.StoryCategoriesMapping.RemoveRange(existingCategories);

                    // Thêm các mapping mới
                    var newStoryCategories = storyDto.CategoryIDs.Select(categoryId => new StoryCategoriesMapping
                    {
                        StoryID = story.StoryID,
                        CategoryID = categoryId
                    }).ToList();
                    _context.StoryCategoriesMapping.AddRange(newStoryCategories);
                }

                await _context.SaveChangesAsync();
                return "Cập nhật truyện thành công!";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (Azure.RequestFailedException azEx)
            {
                return $"Lỗi upload ảnh lên cloud: {azEx.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }

        }
        #endregion

        #region Delete story
        public async Task<string> DeleteStoryAsync(int storyID)
        {
            var story = await _context.Stories
                            .FirstOrDefaultAsync(s => s.StoryID == storyID);
            if (story == null)
            {
                return "Truyện không tồn tại";
            }

            _context.Stories.Remove(story);
            await _context.SaveChangesAsync();

            return "Xóa truyện thành công";

        }
        #endregion

        #region Search story
        public async Task<List<StoryInfor>> SearchStoryAsync(string title)
        {
            try
            {
                List<StoryInfor> listStories = await (from s in _context.Stories
                                                      join u in _context.Users on s.PublisherID equals u.UserID
                                                      join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                      where s.Title.Contains(title)
                                                      select new StoryInfor
                                                      {
                                                          StoryID = s.StoryID,
                                                          Title = s.Title,
                                                          CoverImage = s.CoverImage,
                                                          Status = s.Status,
                                                          PublisherName = u.Username,
                                                          TotalChapter = chapters.Count()
                                                      })
                                         .ToListAsync();
                return listStories;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region Get current update story
        public async Task<IEnumerable<dynamic>> GetCurrentUpdateStoriesAsync(int days)
        {
            try
            {
                DateTime recentDate = DateTime.Now.AddDays(-days);

                var listStories = await (from s in _context.Stories
                                         let latestChapter = _context.Chapters
                                             .Where(c => c.StoryID == s.StoryID)
                                             .OrderByDescending(c => c.CreatedAt)
                                             .FirstOrDefault()
                                         where latestChapter != null && latestChapter.CreatedAt >= recentDate
                                         select new
                                         {
                                             StoryID = s.StoryID,
                                             Title = s.Title,
                                             CoverImage = s.CoverImage,
                                             Views = s.Views,
                                             Likes = s.Likes,
                                             LastestChapter = latestChapter.ChapterNumber,
                                             CreatedAt = latestChapter.CreatedAt
                                         })
                                         .AsNoTracking()
                                         .Take(12)
                                         .ToListAsync();

                if (!listStories.Any())
                {
                    listStories = await (from s in _context.Stories
                                         let latestChapter = _context.Chapters
                                                .Where(c => c.StoryID == s.StoryID)
                                                .OrderByDescending(c => c.CreatedAt)
                                                .FirstOrDefault()
                                         where latestChapter != null
                                         select new
                                         {
                                             StoryID = s.StoryID,
                                             Title = s.Title,
                                             CoverImage = s.CoverImage,
                                             Views = s.Views,
                                             Likes = s.Likes,
                                             LastestChapter = latestChapter.ChapterNumber,
                                             CreatedAt = latestChapter.CreatedAt
                                         })
                                         .OrderByDescending(s => s.Views)
                                         .Take(12)
                                         .AsNoTracking()
                                         .ToListAsync();
                }
                return listStories;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region Get top stories 
        public async Task<List<dynamic>> GetTopStoriesAsync(string topType)
        {
            try
            {
                DateTime now = DateTime.Now;
                DateTime startDate;
                DateTime endDate;
                switch (topType.ToLower())
                {
                    case "day":
                        startDate = now.Date;
                        endDate = startDate.AddDays(1).AddSeconds(-1);
                        break;
                    case "week":
                        startDate = now.Date.AddDays(-(int)now.DayOfWeek);
                        endDate = startDate.AddDays(7).AddSeconds(-1);
                        break;
                    case "month":
                        startDate = new DateTime(now.Year, now.Month, 1);
                        endDate = startDate.AddMonths(1).AddSeconds(-1);
                        break;
                    default:
                        throw new Exception("Invalid top type. Use 'day', 'week', or 'month'.");
                }

                var topStories = await (from s in _context.Stories
                                        where s.CreatedAt >= startDate && s.CreatedAt <= endDate
                                        select new
                                        {
                                            StoryID = s.StoryID,
                                            Title = s.Title,
                                            CoverImage = s.CoverImage,
                                            Views = s.Views,
                                            Likes = s.Likes,
                                            Description = s.Description,
                                            Categories = (from smc in _context.StoryCategoriesMapping
                                                          join c in _context.Categories on smc.CategoryID equals c.CategoryID
                                                          where smc.StoryID == s.StoryID
                                                          select c.CategoryName).ToList()
                                        })
                                        .AsNoTracking()
                                        .OrderByDescending(s => s.Views)
                                        .Take(12)
                                        .ToListAsync<dynamic>();

                if (!topStories.Any())
                {
                    topStories = await (from s in _context.Stories
                                        select new
                                        {
                                            StoryID = s.StoryID,
                                            Title = s.Title,
                                            CoverImage = s.CoverImage,
                                            Views = s.Views,
                                            Likes = s.Likes,
                                            Description = s.Description,
                                            Categories = (from smc in _context.StoryCategoriesMapping
                                                          join c in _context.Categories on smc.CategoryID equals c.CategoryID
                                                          where smc.StoryID == s.StoryID
                                                          select c.CategoryName).ToList()
                                        })
                                        .AsNoTracking()
                                        .OrderByDescending(s => s.Views)
                                        .Take(10)
                                        .ToListAsync<dynamic>();
                }

                return topStories;
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        #endregion

        #region Get advance stories
        public async Task<List<dynamic>> GetAdvanceStories(int userID)
        {
            var userCategories = await (from h in _context.ReadingHistories
                                        where h.UserID == userID
                                        join smc in _context.StoryCategoriesMapping on h.StoryID equals smc.StoryID
                                        select smc.CategoryID)
                                       .Distinct()
                                       .ToListAsync();
            var recommendedStories = await (from s in _context.Stories
                                            join smc in _context.StoryCategoriesMapping on s.StoryID equals smc.StoryID
                                            where userCategories.Contains(smc.CategoryID)
                                            let latestChapter = _context.Chapters
                                                .Where(c => c.StoryID == s.StoryID)
                                                .OrderByDescending(c => c.CreatedAt)
                                                .FirstOrDefault()
                                            where latestChapter != null
                                            select new
                                            {
                                                StoryID = s.StoryID,
                                                Title = s.Title,
                                                CoverImage = s.CoverImage,
                                                Views = s.Views,
                                                Likes = s.Likes,
                                                LastestChapter = latestChapter.ChapterNumber,
                                            })
                                            .AsNoTracking()
                                            .Distinct()
                                            .Take(12)
                                            .ToListAsync<dynamic>();

            if (!recommendedStories.Any())
            {
                recommendedStories = await (from s in _context.Stories
                                            let latestChapter = _context.Chapters
                                                .Where(c => c.StoryID == s.StoryID)
                                                .OrderByDescending(c => c.CreatedAt)
                                                .FirstOrDefault()
                                            where latestChapter != null
                                            select new
                                            {
                                                StoryID = s.StoryID,
                                                Title = s.Title,
                                                CoverImage = s.CoverImage,
                                                Views = s.Views,
                                                Likes = s.Likes,
                                                Description = s.Description,
                                                Categories = (from smc in _context.StoryCategoriesMapping
                                                              join c in _context.Categories on smc.CategoryID equals c.CategoryID
                                                              where smc.StoryID == s.StoryID
                                                              select c.CategoryName).ToList(),
                                                LastestChapter = latestChapter.ChapterNumber,
                                            })
                                            .AsNoTracking()
                                            .OrderByDescending(s => s.Views)
                                            .Take(12)
                                            .ToListAsync<dynamic>();
            }
            return recommendedStories;
        }
        #endregion
    }
}
