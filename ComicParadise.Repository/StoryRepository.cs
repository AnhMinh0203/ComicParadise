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
using ComicParadise.DataContext.Utils;
using Newtonsoft.Json;

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
        private readonly IChapterRepository _chapterRepository;
        public StoryRepository(
            AppDbContext context,
            IConfiguration config,
            /*            BlobServiceClient blobServiceClient,*/
            IAmazonS3 s3Client,
            IChapterRepository chapterRepository)
        {
            _context = context;
            _config = config;
            // _blobServiceClient = blobServiceClient;
            _s3Client = s3Client;
            _bucketName = _config["BucketName"];
            _containerCoverImg = _config["ContainerCoverImg"];
            _chapterRepository = chapterRepository;
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

                if (createStoryDto.Chapters != null && createStoryDto.Chapters.Any())
                {
                    foreach (var chapter in createStoryDto.Chapters)
                    {
                        chapter.StoryID = newStory.StoryID;
                        await _chapterRepository.PostChapterAsync(chapter); 
                    }
                }
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
                if (userID != null)
                {


                    List<StoryInfor> listStories = await (from s in _context.Stories
                                                          join u in _context.Users on s.PublisherID equals u.UserID
                                                          join c in _context.Chapters on s.StoryID equals c.StoryID into chapters
                                                          where s.PublisherID == userID
                                                          /*&& s.Status != "Pending"*/
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
                                                          /*                                        where s.Status != "Pending"*/
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

        #region Get current update story - Done
        public async Task<PagedResult<CurrentUpdateStoryDto>> GetCurrentUpdateStoriesAsync(int days, int pageIndex, int pageSize)
        {
            var recentDate = DateTime.Now.AddDays(-days);
            int skip = (pageIndex - 1) * pageSize;

            var latestChaptersQuery = _context.Chapters
                .Where(c => c.CreatedAt == _context.Chapters
                    .Where(c2 => c2.StoryID == c.StoryID)
                    .Max(c2 => c2.CreatedAt))
                .Select(c => new { c.StoryID, c.ChapterNumber, c.CreatedAt });

            var query = from c in latestChaptersQuery
                        join s in _context.Stories on c.StoryID equals s.StoryID
                        where s.Type == "Manga"
                        select new CurrentUpdateStoryDto
                        {
                            StoryID = s.StoryID,
                            Title = s.Title,
                            CoverImage = s.CoverImage,
                            Views = s.Views,
                            Likes = s.Likes,
                            Type = s.Type,
                            LatestChapter = c.ChapterNumber,
                            CreatedAt = c.CreatedAt
                        };

            var recentQuery = query
                .Where(x => x.CreatedAt >= recentDate)
                .OrderByDescending(x => x.CreatedAt);

            var fallbackQuery = query
                .Where(x => x.CreatedAt < recentDate)
                .OrderByDescending(x => x.Views);

            var combinedQuery = recentQuery.Concat(fallbackQuery);

            var pagedItems = await combinedQuery
                .AsNoTracking()
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            var totalCount = await combinedQuery.CountAsync();
            var randomizedItems = pagedItems.OrderBy(x => Guid.NewGuid()).ToList();
            return new PagedResult<CurrentUpdateStoryDto>
            {
                Items = randomizedItems,
                TotalCount = totalCount
            };
        }




        #endregion

        #region Get top stories - Done
        public async Task<PagedResult<TopStoryDto>> GetTopStoriesAsync(string topType, int pageIndex, int pageSize)
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
                        throw new ArgumentException("Invalid top type. Use 'day', 'week', or 'month'.");
                }

                int skip = (pageIndex - 1) * pageSize;

                var baseQuery = _context.Stories
                    .Where(s => s.Type == "Manga")
                    .Where(s => s.CreatedAt >= startDate && s.CreatedAt <= endDate)
                    .Select(s => new TopStoryDto
                    {
                        StoryID = s.StoryID,
                        Title = s.Title,
                        CoverImage = s.CoverImage,
                        Views = s.Views,
                        Likes = s.Likes,
                        Description = s.Description,
                        Categories = _context.StoryCategoriesMapping
                            .Where(m => m.StoryID == s.StoryID)
                            .Join(_context.Categories,
                                  smc => smc.CategoryID,
                                  c => c.CategoryID,
                                  (smc, c) => c.CategoryName)
                            .ToList()
                    });

                int totalCount = await baseQuery.CountAsync();

                if (totalCount == 0 || totalCount < pageSize)
                {
                    baseQuery = _context.Stories
                        .Where(s => s.Type == "Manga")
                        .OrderByDescending(s => s.Views)
                        .Select(s => new TopStoryDto
                        {
                            StoryID = s.StoryID,
                            Title = s.Title,
                            CoverImage = s.CoverImage,
                            Views = s.Views,
                            Likes = s.Likes,
                            Description = s.Description,
                            Categories = _context.StoryCategoriesMapping
                                .Where(m => m.StoryID == s.StoryID)
                                .Join(_context.Categories,
                                      smc => smc.CategoryID,
                                      c => c.CategoryID,
                                      (smc, c) => c.CategoryName)
                                .ToList()
                        });

                    totalCount = await baseQuery.CountAsync();
                }

                var items = await baseQuery
                    .OrderByDescending(s => s.Views)
                    .Skip(skip)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToListAsync();

                var randomizedItems = items.OrderBy(x => Guid.NewGuid()).ToList();

                return new PagedResult<TopStoryDto>
                {
                    Items = randomizedItems,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw;
            }
        }


        #endregion

        #region Get advance stories - Done
        public async Task<PagedResult<AdvanceStoryDto>> GetAdvanceStories(int? userID, int pageIndex, int pageSize)
        {
            List<int> allStoryIds;
            int totalCount;

            if (userID != null)
            {
                var userCategoryIds = await _context.ReadingHistories
                    .Where(h => h.UserID == userID)
                    .Join(_context.StoryCategoriesMapping,
                          h => h.StoryID,
                          smc => smc.StoryID,
                          (h, smc) => smc.CategoryID)
                    .Distinct()
                    .ToListAsync();

                var storyIdsA = await _context.StoryCategoriesMapping
                    .Where(smc => userCategoryIds.Contains(smc.CategoryID))
                    .Join(_context.Stories.Where(s => s.Type == "Manga"),
                          smc => smc.StoryID,
                          s => s.StoryID,
                          (smc, s) => s.StoryID)
                    .Distinct()
                    .ToListAsync();

                var storyIdsB = await _context.Stories
                    .Where(s => s.Type == "Manga" &&
                                !_context.StoryCategoriesMapping
                                    .Any(smc => smc.StoryID == s.StoryID &&
                                                userCategoryIds.Contains(smc.CategoryID)))
                    .Select(s => s.StoryID)
                    .ToListAsync();

                allStoryIds = storyIdsA.Concat(storyIdsB).Distinct().ToList();
                totalCount = allStoryIds.Count;
            }
            else
            {
                allStoryIds = await _context.Stories
                    .Where(s => s.Type == "Manga")
                    .OrderByDescending(s => s.Views)
                    .Select(s => s.StoryID)
                    .ToListAsync();

                totalCount = allStoryIds.Count;
            }

            var pagedStoryIds = allStoryIds
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var stories = await _context.Stories
                .Where(s => pagedStoryIds.Contains(s.StoryID))
                .Select(s => new AdvanceStoryDto
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
                    LastestChapter = _context.Chapters
                        .Where(c => c.StoryID == s.StoryID)
                        .OrderByDescending(c => c.CreatedAt)
                        .Select(c => c.ChapterNumber)
                        .FirstOrDefault()
                })
                .AsNoTracking()
                .ToListAsync();

            var orderedResult = pagedStoryIds
                .Join(stories,
                      id => id,
                      s => s.StoryID,
                      (id, story) => story)
                .ToList();

            var randomizedItems = orderedResult.OrderBy(x => Guid.NewGuid()).ToList();
            return new PagedResult<AdvanceStoryDto>
            {
                Items = randomizedItems,
                TotalCount = totalCount
            };
        }


        #endregion

        #region Get novel - Done
        public async Task<PagedResult<StoryDto>> GetNovelStories(int pageIndex, int pageSize)
        {
            var skip = (pageIndex - 1) * pageSize;
            var query = _context.Stories
                .AsNoTracking()
                .Where(s => s.Type == "Novel");
            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(s => s.Views)
                .Skip(skip)
                .Take(pageSize)
                .Select(s => new StoryDto
                {
                    StoryID = s.StoryID,
                    Title = s.Title,
                    CoverImage = s.CoverImage,
                    Views = s.Views,
                    Likes = s.Likes,
                    Type = s.Type
                })
                .ToListAsync();

            return new PagedResult<StoryDto>
            {
                Items = items,
                TotalCount = totalCount
            };
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

        #region Get favorite stories - Done
        public async Task<List<dynamic>> GetFavoriteStoriesAsync(int userID)
        {
            var query = from f in _context.Favorites
                        where f.UserID == userID
                        join s in _context.Stories on f.StoryID equals s.StoryID
                        select new
                        {
                            s.StoryID,
                            s.Title,
                            s.CoverImage,
                            s.CreatedAt,
                            s.Views,
                            s.Likes,
                            Categories = (from sc in _context.StoryCategoriesMapping
                                          where sc.StoryID == s.StoryID
                                          join c in _context.Categories on sc.CategoryID equals c.CategoryID
                                          select c)
                        };

            var result = await query
                .Select(x => new
                {
                    x.StoryID,
                    x.Title,
                    x.CoverImage,
                    x.CreatedAt,
                    x.Views,
                    x.Likes,
                    IsLiked = true,
                    Categories = x.Categories.ToList()
                })
                .ToListAsync<dynamic>();

            return result;
        }

        #endregion

        #region Rating story - Done
        public async Task<bool> RatingStoryAsync(RatingStoryDto ratingStoryDto)
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

        #region Get user rating - Done 
        public async Task<int?> GetUserRating(int storyID, int userID)
        {
            var isExistRating = await _context.Ratings
                                            .Where(r => r.UserID == userID && r.StoryID == storyID)
                                            .FirstOrDefaultAsync();
            if (isExistRating == null)
            {
                return null;
            }
            return isExistRating.RatingValue;
        }
        #endregion

        #region Get story rating - Done 
        public async Task<int?> GetStoryRatingAsync(int storyID)
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

        #region Filter story by conditions - Done
        public async Task<List<dynamic>> FilterStoryByConditionsAsync(StoryFilterConditionsRequest filter)
        {
            try
            {
                // B1: Lọc danh sách Story ban đầu
                var baseQuery = _context.Stories.AsQueryable();

                if (filter.IsManga == true && filter.IsNovel != true)
                    baseQuery = baseQuery.Where(s => s.Type == "Manga");
                else if (filter.IsNovel == true && filter.IsManga != true)
                    baseQuery = baseQuery.Where(s => s.Type == "Novel");

                if (filter.CompletionStatus == "completed")
                    baseQuery = baseQuery.Where(s => s.IsComplete);
                else if (filter.CompletionStatus == "updating")
                    baseQuery = baseQuery.Where(s => !s.IsComplete);

                var storyIds = await baseQuery.Select(s => s.StoryID).ToListAsync();

                if (!storyIds.Any())
                    return new List<dynamic>();

                var chapterCounts = await _context.Chapters
                    .Where(c => storyIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new { g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Key, x => x.Count);

                var latestChapters = await _context.Chapters
                    .Where(c => storyIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new
                    {
                        g.Key,
                        Latest = g.OrderByDescending(c => c.CreatedAt).FirstOrDefault().ChapterNumber
                    })
                    .ToDictionaryAsync(x => x.Key, x => x.Latest);

                var ratings = await _context.Ratings
                    .Where(r => storyIds.Contains(r.StoryID))
                    .GroupBy(r => r.StoryID)
                    .Select(g => new { g.Key, Avg = g.Average(x => (double?)x.RatingValue) ?? 0 })
                    .ToDictionaryAsync(x => x.Key, x => x.Avg);

                var users = await _context.Users
                    .ToDictionaryAsync(u => u.UserID, u => u.Username);

                var storyInfoList = await _context.Stories
                    .Where(s => storyIds.Contains(s.StoryID))
                    .Select(s => new
                    {
                        s.StoryID,
                        s.Title,
                        s.CoverImage,
                        s.IsComplete,
                        PublisherName = users.ContainsKey(s.PublisherID) ? users[s.PublisherID] : "Unknown",
                        s.Views,
                        s.Likes,
                        s.Type
                    })
                    .ToListAsync();

                var result = storyInfoList
                    .Select(s => new
                    {
                        s.StoryID,
                        s.Title,
                        s.CoverImage,
                        CompletionStatus = s.IsComplete ? "completed" : "updating",
                        s.PublisherName,
                        s.Views,
                        s.Likes,
                        s.Type,
                        ChapterCount = chapterCounts.TryGetValue(s.StoryID, out var count) ? count : 0,
                        LastestChapter = latestChapters.TryGetValue(s.StoryID, out var latest) ? latest : 0,
                        AverageRating = ratings.TryGetValue(s.StoryID, out var avg) ? avg : 0
                    })
                    .ToList<dynamic>();

                if (filter.HighestViews == true)
                {
                    result = result.OrderByDescending(x => x.Views).ToList<dynamic>();
                }
                else if (filter.HighestRates == true)
                {
                    result = result.OrderByDescending(x => x.AverageRating).ToList<dynamic>();
                }

                if (filter.MinChapters.HasValue)
                {
                    result = result.Where(x => x.ChapterCount >= filter.MinChapters.Value).ToList<dynamic>();
                }

                if (filter.MaxChapters.HasValue)
                {
                    result = result.Where(x => x.ChapterCount <= filter.MaxChapters.Value).ToList<dynamic>();
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lọc truyện: " + ex.Message);
            }
        }

        #endregion

        #region Filter story by categories - Done
        public async Task<List<dynamic>> FilterStoriesByCategoryIdsAsync(List<int> categoryIds)
        {
            try
            {
                if (categoryIds == null || !categoryIds.Any())
                    return new List<dynamic>();

                var filteredStoryIds = await _context.StoryCategoriesMapping
                    .Where(sc => categoryIds.Contains(sc.CategoryID))
                    .Select(sc => sc.StoryID)
                    .Distinct()
                    .ToListAsync();

                if (!filteredStoryIds.Any())
                    return new List<dynamic>();

                var users = await _context.Users
                    .ToDictionaryAsync(u => u.UserID, u => u.Username);

                var chapterCounts = await _context.Chapters
                    .Where(c => filteredStoryIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new { g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Key, x => x.Count);

                var latestChapters = await _context.Chapters
                    .Where(c => filteredStoryIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new
                    {
                        g.Key,
                        Latest = g.OrderByDescending(c => c.CreatedAt).FirstOrDefault().ChapterNumber
                    })
                    .ToDictionaryAsync(x => x.Key, x => x.Latest);

                var ratings = await _context.Ratings
                    .Where(r => filteredStoryIds.Contains(r.StoryID))
                    .GroupBy(r => r.StoryID)
                    .Select(g => new { g.Key, Avg = g.Average(r => (double?)r.RatingValue) ?? 0 })
                    .ToDictionaryAsync(x => x.Key, x => x.Avg);

                var stories = await _context.Stories
                    .Where(s => filteredStoryIds.Contains(s.StoryID))
                    .Select(s => new
                    {
                        s.StoryID,
                        s.Title,
                        s.CoverImage,
                        s.IsComplete,
                        s.PublisherID,
                        s.Views,
                        s.Likes,
                        s.Type
                    })
                    .ToListAsync();

                var result = stories.Select(s => new
                {
                    s.StoryID,
                    s.Title,
                    s.CoverImage,
                    CompletionStatus = s.IsComplete ? "completed" : "updating",
                    PublisherName = users.ContainsKey(s.PublisherID) ? users[s.PublisherID] : "Unknown",
                    s.Views,
                    s.Likes,
                    s.Type,
                    ChapterCount = chapterCounts.TryGetValue(s.StoryID, out var count) ? count : 0,
                    LastestChapter = latestChapters.TryGetValue(s.StoryID, out var latest) ? latest : 0,
                    AverageRating = ratings.TryGetValue(s.StoryID, out var avg) ? avg : 0
                }).ToList<dynamic>();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lọc truyện theo thể loại: " + ex.Message);
            }
        }


        #endregion

        #region Filter story by category name - Done
        public async Task<List<dynamic>> FilterStoriesByCategoryNameAsync(string categoryName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(categoryName))
                    return new List<dynamic>();

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryName == categoryName);

                if (category == null)
                    return new List<dynamic>();

                int? categoryId = category.CategoryID;

                var storyIds = await _context.StoryCategoriesMapping
                    .Where(sc => sc.CategoryID == categoryId)
                    .Select(sc => sc.StoryID)
                    .Distinct()
                    .ToListAsync();

                if (!storyIds.Any())
                    return new List<dynamic>();

                var users = await _context.Users
                    .ToDictionaryAsync(u => u.UserID, u => u.Username);

                var chapterCounts = await _context.Chapters
                    .Where(c => storyIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new { g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Key, x => x.Count);

                var latestChapters = await _context.Chapters
                    .Where(c => storyIds.Contains(c.StoryID))
                    .GroupBy(c => c.StoryID)
                    .Select(g => new
                    {
                        g.Key,
                        Latest = g.OrderByDescending(c => c.CreatedAt).FirstOrDefault().ChapterNumber
                    })
                    .ToDictionaryAsync(x => x.Key, x => x.Latest);

                var ratings = await _context.Ratings
                    .Where(r => storyIds.Contains(r.StoryID))
                    .GroupBy(r => r.StoryID)
                    .Select(g => new { g.Key, Avg = g.Average(r => (double?)r.RatingValue) ?? 0 })
                    .ToDictionaryAsync(x => x.Key, x => x.Avg);

                var stories = await _context.Stories
                    .Where(s => storyIds.Contains(s.StoryID))
                    .Select(s => new
                    {
                        s.StoryID,
                        s.Title,
                        s.CoverImage,
                        s.IsComplete,
                        s.PublisherID,
                        s.Views,
                        s.Likes,
                        s.Type
                    })
                    .ToListAsync();

                var result = stories.Select(s => new
                {
                    s.StoryID,
                    s.Title,
                    s.CoverImage,
                    CompletionStatus = s.IsComplete ? "completed" : "updating",
                    PublisherName = users.ContainsKey(s.PublisherID) ? users[s.PublisherID] : "Unknown",
                    s.Views,
                    s.Likes,
                    s.Type,
                    ChapterCount = chapterCounts.TryGetValue(s.StoryID, out var count) ? count : 0,
                    LastestChapter = latestChapters.TryGetValue(s.StoryID, out var latest) ? latest : 0,
                    AverageRating = ratings.TryGetValue(s.StoryID, out var avg) ? avg : 0
                }).ToList<dynamic>();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lọc truyện theo tên thể loại: " + ex.Message);
            }
        }


        #endregion
    }
}
