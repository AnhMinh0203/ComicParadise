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
using Amazon.S3;
using Amazon.S3.Model;

namespace ComicParadise.Repository
{
    public class StoryRepository : IStoryRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        // private readonly BlobServiceClient _blobServiceClient;

        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;
        private readonly string _containerCoverImg;
        public StoryRepository(
            AppDbContext context,
            IConfiguration config,
            BlobServiceClient blobServiceClient,
            IAmazonS3 s3Client)
        {
            _context = context;
            _config = config;
            // _blobServiceClient = blobServiceClient;
            _s3Client = s3Client;
            _bucketName = _config["BucketName"];
            _containerCoverImg = _config["ContainerCoverImg"];
        }

        #region Add story (azure)
        /*public async Task<string> AddStoryAsync(AddStoryDto createStoryDto)
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
                    CompletionStatus = status,
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

        }*/
        #endregion

        #region Add story (aws)
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
                var fileName = $"cover-{Guid.NewGuid()}{Path.GetExtension(createStoryDto.CoverImage.FileName)}";
                string primaryImgUrl = await UploadFileToS3(createStoryDto.CoverImage, _containerCoverImg, fileName);

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

        #region Upload file to AWS 
        private async Task<string> UploadFileToS3(IFormFile file, string prefix, string fileName)
        {
            try
            {
                // Tạo key (đường dẫn) trên S3: prefix/story-id/filename
                var key = $"{prefix}/{fileName}"; // Ví dụ: "cover-image/cover-123.jpg"

                using var stream = file.OpenReadStream();
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType
                };

                var response = await _s3Client.PutObjectAsync(request);
                if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
                {
                    // Trả về URL của file trên S3
                    return $"https://{_bucketName}.s3.amazonaws.com/{key}";
                }

                throw new Exception("Upload file lên S3 thất bại");
            }
            catch (AmazonS3Exception ex)
            {
                throw new Exception($"Lỗi upload file lên S3: {ex.Message}");
            }
        }
        #endregion

        #region Delete file from AWS
        private async Task DeleteFileFromS3(string fileUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(fileUrl))
                    return;
                var uri = new Uri(fileUrl);
                var key = uri.AbsolutePath.Substring(1);

                var request = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                await _s3Client.DeleteObjectAsync(request);
            }
            catch (AmazonS3Exception ex)
            {
                throw new Exception($"Lỗi xóa file trên S3: {ex.Message}");
            }
        }
        #endregion

        #region Get stories
        public async Task<List<StoryInfor>> GetStoriesAsync(int? userID, string? storyStatus)
        {
            try
            {
                if(userID != null)
                {
                   

                    List<StoryInfor> listStories = await (from s in _context.Stories
                                                          join u in _context.Users on s.PublisherID equals u.UserID
                                                          join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                          where s.PublisherID == userID && s.Status != "Pending"
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
                else if (storyStatus != null)
                {
                    List<StoryInfor> listStories = await (from s in _context.Stories
                                                          join u in _context.Users on s.PublisherID equals u.UserID
                                                          join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                          where s.Status == storyStatus && s.Status == "Pending"
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
                else
                {
                    List<StoryInfor> listStories = await (from s in _context.Stories
                                                          join u in _context.Users on s.PublisherID equals u.UserID
                                                          join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                          where s.Status != "Pending"
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
                                         Views = s.Views,
                                         Likes = s.Likes
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

        #region Update story infor (Azure)
        /*public async Task<string> UpdateStoryAsync(UpdateStoryDto storyDto)
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
        }*/
        #endregion

        #region Update story infor (AWS)
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
                    // Xóa ảnh bìa cũ trên S3 (nếu có)
                    if (!string.IsNullOrEmpty(story.CoverImage))
                    {
                        await DeleteFileFromS3(story.CoverImage);
                    }

                    // Tải ảnh bìa mới lên S3
                    var fileName = $"cover-{Guid.NewGuid()}{Path.GetExtension(storyDto.CoverImage.FileName)}";
                    string newCoverImageUrl = await UploadFileToS3(storyDto.CoverImage, _containerCoverImg, fileName);
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
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi xử lý file trên S3: {s3Ex.Message}";
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
        public async Task<List<dynamic>> SearchStoryAsync(string title)
        {
            try
            {
                var listStories = await (from s in _context.Stories
                                         join u in _context.Users on s.PublisherID equals u.UserID
                                         join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                         where s.Title.Contains(title)

                                         let latestChapter = _context.Chapters
                                            .Where(c => c.StoryID == s.StoryID)
                                            .OrderByDescending(c => c.CreatedAt)
                                            .FirstOrDefault()
                                         select new
                                         {
                                             StoryID = s.StoryID,
                                             Title = s.Title,
                                             CoverImage = s.CoverImage,
                                             Status = s.Status,
                                             PublisherName = u.Username,
                                             Views = s.Views,
                                             Likes = s.Likes,
                                             LastestChapter = latestChapter.ChapterNumber,
                                         })
                                         .ToListAsync<dynamic>();
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

                if (!listStories.Any() || listStories.Count() < 12)
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

                if (!topStories.Any() || topStories.Count() < 12)
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

            if (!recommendedStories.Any() || recommendedStories.Count() < 12)
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

        #region Like story
        public async Task<string> LikeStoryAsync(int userID, int storyID)
        {
            try
            {
                var story = await _context.Stories.FirstOrDefaultAsync(s => s.StoryID == storyID);
                var isFavorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserID == userID && f.StoryID == storyID);

                if (isFavorite == null)
                {
                    story.Likes += 1;

                    Favorite favorite = new Favorite
                    {
                        StoryID = storyID,
                        UserID = userID,
                        CreatedAt = DateTime.Now,
                    };

                    _context.Favorites.Add(favorite);
                }
                else
                {
                    story.Likes -= 1;
                    _context.Favorites.Remove(isFavorite);
                }

                await _context.SaveChangesAsync();

                return "Thích truyện thành công";
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        #endregion

        #region Like stories (for list of favorite stories)
        public async Task<string> LikeStoriesAsync(LikeStoryRequest likeStoryRequest)
        {
            try
            {
                var stories = await _context.Stories.Where(s => likeStoryRequest.StoryIDs.Contains(s.StoryID)).ToListAsync();
                var existingFavorites = await _context.Favorites
                    .Where(f => f.UserID == likeStoryRequest.UserID && likeStoryRequest.StoryIDs.Contains(f.StoryID))
                    .ToListAsync();

                List<Favorite> newFavorites = new List<Favorite>();
                List<Favorite> favoritesToRemove = new List<Favorite>();

                foreach (var story in stories)
                {
                    var isFavorite = existingFavorites.FirstOrDefault(f => f.StoryID == story.StoryID);
                    if (isFavorite == null)
                    {
                        // Thích truyện
                        story.Likes += 1;
                        newFavorites.Add(new Favorite
                        {
                            StoryID = story.StoryID,
                            UserID = likeStoryRequest.UserID,
                            CreatedAt = DateTime.Now,
                        });
                    }
                    else
                    {
                        // Hủy thích truyện
                        story.Likes -= 1;
                        favoritesToRemove.Add(isFavorite);
                    }
                }

                if (newFavorites.Count > 0)
                    await _context.Favorites.AddRangeAsync(newFavorites);

                if (favoritesToRemove.Count > 0)
                    _context.Favorites.RemoveRange(favoritesToRemove);

                await _context.SaveChangesAsync();

                return "Cập nhật thích truyện thành công";
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        #endregion

        #region Check is liked
        public async Task<bool> CheckIsLikedAsync(int userID, int storyID)
        {
            var story = await _context.Stories.FirstOrDefaultAsync(s => s.StoryID == storyID);
            var isFavorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserID == userID && f.StoryID == storyID);

            if (isFavorite != null)
            {
                return true;
            }
            return false;
        }
        #endregion

        #region Get favorite stories
        public async Task<List<dynamic>> GetFavoriteStoriesAsync(int userID)
        {
            var stories = await (from f in _context.Favorites
                                 join s in _context.Stories
                                 on f.StoryID equals s.StoryID
                                 where f.UserID == userID
                                 select new
                                 {
                                     StoryID = s.StoryID,
                                     Title = s.Title,
                                     CoverImage = s.CoverImage,
                                     CreatedAt = s.CreatedAt,
                                     Likes = s.Likes,
                                     IsLiked = true
                                 }).ToListAsync<dynamic>();
            return stories;
        }
        #endregion

        #region Rating story
        public async Task<bool> RatingStoryAsync (RatingStoryDto ratingStoryDto)
        {
            try
            {
                var isExistRating = await _context.Ratings
                                                .Where(r => r.UserID == ratingStoryDto.UserID && r.StoryID == ratingStoryDto.StoryID)
                                                .FirstOrDefaultAsync();
                if (isExistRating != null)
                {
                    isExistRating.RatingValue = ratingStoryDto.RatingValue;
                    await _context.SaveChangesAsync();
                    return true;

                }
                else
                {
                    var newRate = new Rating
                    {
                        UserID = ratingStoryDto.UserID,
                        StoryID = ratingStoryDto.StoryID,
                        RatingValue = ratingStoryDto.RatingValue,
                    };
                    _context.Ratings.Add(newRate);
                    await _context.SaveChangesAsync();
                    return true;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }   
        }
        #endregion

        #region Get user rating 
        public async Task<int?> GetUserRating (int storyID, int userID)
        {
            var isExistRating = await _context.Ratings
                                            .Where(r => r.UserID ==  userID && r.StoryID == storyID)
                                            .FirstOrDefaultAsync();
            if(isExistRating == null)
            {
                return null;
            }
            return isExistRating.RatingValue;
        }
        #endregion

        #region Get story rating 
        public async Task<int?> GetStoryRatingAsync (int storyID)
        {
            var ratings = await _context.Ratings
                                .Where(r => r.StoryID == storyID)
                                .ToListAsync();

            if (ratings == null || ratings.Count == 0)
            {
                return null; 
            }
            var average = ratings.Average(r => r.RatingValue);
            return (int)Math.Round(average);

        }

        #endregion

        #region Filter story by conditions
        public async Task<List<dynamic>> FilterStoryByConditionsAsync(StoryFilterConditionsRequest filter)
        {
            try
            {
                var query = from s in _context.Stories
                            join u in _context.Users on s.PublisherID equals u.UserID
                            let latestChapter = _context.Chapters
                                .Where(c => c.StoryID == s.StoryID)
                                .OrderByDescending(c => c.CreatedAt)
                                .FirstOrDefault()
                            let chapterCount = _context.Chapters
                                .Count(c => c.StoryID == s.StoryID)
                            let averageRating = _context.Ratings
                                .Where(r => r.StoryID == s.StoryID)
                                .Select(r => (double?)r.RatingValue)
                                .Average() ?? 0
                            select new
                            {
                                StoryID = s.StoryID,
                                Title = s.Title,
                                CoverImage = s.CoverImage,
                                CompletionStatus = s.IsComplete ? "completed" : "updating",
                                PublisherName = u.Username,
                                Views = s.Views,
                                Likes = s.Likes,
                                Type = s.Type,
                                LastestChapter = latestChapter != null ? latestChapter.ChapterNumber : 0,
                                ChapterCount = chapterCount,
                                AverageRating = averageRating
                            };


                if (filter.IsManga.HasValue || filter.IsNovel.HasValue)
                {
                    var typeFilters = new List<string>();
                    if (filter.IsManga == true)
                    {
                        typeFilters.Add("Manga");
                    }
                    if (filter.IsNovel == true)
                    {
                        typeFilters.Add("Novel");
                    }

                    if (typeFilters.Any())
                    {
                        query = query.Where(s => typeFilters.Contains(s.Type));
                    }
                   
                }

                if (!string.IsNullOrEmpty(filter.CompletionStatus) && filter.CompletionStatus != "all")
                {
                    if (filter.CompletionStatus == "completed")
                    {
                        query = query.Where(s => s.CompletionStatus == "completed"); // IsComplete == true
                    }
                    else if (filter.CompletionStatus == "updating")
                    {
                        query = query.Where(s => s.CompletionStatus == "updating"); // IsComplete == false
                    }
                }

                if (filter.MinChapters.HasValue)
                {
                    query = query.Where(s => s.ChapterCount >= filter.MinChapters.Value);
                }

                if (filter.MaxChapters.HasValue)
                {
                    query = query.Where(s => s.ChapterCount <= filter.MaxChapters.Value);
                }

                // Sắp xếp theo lượt xem hoặc đánh giá
                if (filter.HighestViews == true)
                {
                    query = query.OrderByDescending(s => s.Views);
                }
                if (filter.HighestRates == true)
                {
                    query = query.OrderByDescending(s => s.AverageRating);
                }


                // Thực thi truy vấn và trả về kết quả
                var listStories = await query.ToListAsync<dynamic>();
                return listStories;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lọc truyện: " + ex.Message);
            }
        }
        #endregion

        #region Filter story by categories
        public async Task<List<dynamic>> FilterStoriesByCategoryIdsAsync(List<int> categoryIds)
        {
            try
            {
                // Lấy danh sách các StoryID có ít nhất 1 CategoryID nằm trong list
                var filteredStoryIds = await _context.StoryCategoriesMapping
                    .Where(sc => categoryIds.Contains(sc.CategoryID))
                    .Select(sc => sc.StoryID)
                    .Distinct()
                    .ToListAsync();

                // Tiếp tục truy vấn chi tiết truyện như cũ
                var query = from s in _context.Stories
                            join u in _context.Users on s.PublisherID equals u.UserID
                            where filteredStoryIds.Contains(s.StoryID)
                            let latestChapter = _context.Chapters
                                .Where(c => c.StoryID == s.StoryID)
                                .OrderByDescending(c => c.CreatedAt)
                                .FirstOrDefault()
                            let chapterCount = _context.Chapters
                                .Count(c => c.StoryID == s.StoryID)
                            let averageRating = _context.Ratings
                                .Where(r => r.StoryID == s.StoryID)
                                .Select(r => (double?)r.RatingValue)
                                .Average() ?? 0
                            select new
                            {
                                StoryID = s.StoryID,
                                Title = s.Title,
                                CoverImage = s.CoverImage,
                                CompletionStatus = s.IsComplete ? "completed" : "updating",
                                PublisherName = u.Username,
                                Views = s.Views,
                                Likes = s.Likes,
                                Type = s.Type,
                                LastestChapter = latestChapter != null ? latestChapter.ChapterNumber : 0,
                                ChapterCount = chapterCount,
                                AverageRating = averageRating
                            };

                return await query.ToListAsync<dynamic>();
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lọc truyện theo thể loại: " + ex.Message);
            }
        }

        #endregion
    }
}
