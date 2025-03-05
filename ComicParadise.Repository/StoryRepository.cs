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
        public async Task<string> AddStoryAsync(CreateStoryDto createStoryDto)
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

                                         Chapters = (from ct in _context.Chapters
                                                     where ct.StoryID == storyID
                                                     orderby ct.ChapterNumber ascending
                                                     select ct).ToList(),

                                         comments = (from cm in _context.Comments
                                                     join u2 in _context.Users on cm.UserID equals u2.UserID into users
                                                     from u2 in users.DefaultIfEmpty()
                                                     where cm.StoryID == storyID
                                                     select new CommentDto
                                                     {
                                                         CommentID = cm.CommentID,
                                                         StoryID = cm.StoryID,
                                                         UserID = cm.UserID,
                                                         Username = u2 != null ? u2.Username : "Người dùng ẩn danh",
                                                         Content = cm.Content,
                                                         CreatedAt = cm.CreatedAt,
                                                         Status = cm.Status,
                                                         Reply = cm.Reply,
                                                         Likes = cm.Likes,
                                                         DisLikes = cm.DisLikes,
                                                         ChildComments = new List<CommentDto>() 
                                                     }).ToList()
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
    }
}
