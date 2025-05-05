using Amazon.S3;
using Amazon.S3.Model;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class TutorialManagementRepository : ITutorialRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
/*        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;
        private readonly string _containerTutorialImg;*/

        public TutorialManagementRepository(
            AppDbContext context,
            IConfiguration config
/*            IAmazonS3 s3Client,
            string? bucketName,
            string containerTutorialImg*/
            
            )
        {
            _config = config;
            _context = context;
/*            _bucketName = bucketName;
            _s3Client = s3Client;
            _containerTutorialImg = containerTutorialImg;*/
        }

        #region Add tutorial
        public async Task<string> AddTutorialAsync(AddTutorialDto tutorialDto)
        {
            Tutorial tutorial = new Tutorial
            {
                Title = tutorialDto.Title,
                Content = tutorialDto.Content,
            };

            _context.Tutorials.Add(tutorial);
            await _context.SaveChangesAsync();
            return "Tạo hướng dẫn thành công";
        }

        // Cải tiến sau nếu có thời gian
        /*public async Task<string> AddTutorialAsync(AddTutorialDto tutorialDto)
        {
            try
            {
                string pattern = @"<img[^>]*src=[""']data:image/(?<type>[^;]+);base64,(?<data>[^""']+)[""'][^>]*>";
                var matches = Regex.Matches(tutorialDto.Content, pattern);

                foreach (Match match in matches)
                {
                    string base64Data = match.Groups["data"].Value;
                    string fileType = match.Groups["type"].Value;
                    string originalImgTag = match.Value;

                    // Convert base64 -> byte[]
                    byte[] imageBytes = Convert.FromBase64String(base64Data);
                    using var ms = new MemoryStream(imageBytes);

                    // Tạo "fake" file name & content type
                    var fileName = $"tutorial-img-{Guid.NewGuid()}.{fileType}";
                    var contentType = $"image/{fileType}";

                    // Upload ảnh lên S3
                    string uploadedUrl = await UploadFileStreamToS3(ms, "tutorial-content-img", fileName, contentType);

                    // Replace tag ảnh cũ
                    string newImgTag = $"<img src=\"{uploadedUrl}\" />";
                    tutorialDto.Content = tutorialDto.Content.Replace(originalImgTag, newImgTag);
                }

                // Save tutorial to DB
                Tutorial tutorial = new Tutorial
                {
                    Title = tutorialDto.Title,
                    Content = tutorialDto.Content
                };

                _context.Tutorials.Add(tutorial);
                await _context.SaveChangesAsync();

                return "Tạo hướng dẫn thành công";
            }
            catch (Exception ex)
            {
                return $"Lỗi khi thêm tutorial: {ex.Message}";
            }
        }*/

        #endregion

        #region Get tutorial title
        public async Task<List<string>> GetTutorialTitlesAsync()
        {
            var tutorials = await _context.Tutorials.Select(t => t.Title).ToListAsync();
            return tutorials;
        }
        #endregion

        #region Get content by title 
        public async Task<string?> GetContentByTitleAsyn (string title)
        {
            var content = await _context.Tutorials
                                .Where(t => t.Title == title)
                                .Select(t => t.Content).FirstOrDefaultAsync();
            return content;
        }
        #endregion

        #region Get tutorials 
        public async Task<List<Tutorial>> GetAllTutorialsAysnc()
        {
            return await _context.Tutorials.Select (t => t).ToListAsync();
        }
        #endregion

        #region Upload file stream to S3
        // Chưa thực sự hoàn thiện
        /*private async Task<string> UploadFileStreamToS3(Stream stream, string prefix, string fileName, string contentType)
        {
            try
            {
                var key = $"{prefix}/{fileName}";
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = contentType
                };

                var response = await _s3Client.PutObjectAsync(request);
                if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
                {
                    return $"https://{_bucketName}.s3.amazonaws.com/{key}";
                }

                throw new Exception("Upload file lên S3 thất bại");
            }
            catch (AmazonS3Exception ex)
            {
                throw new Exception($"Lỗi upload file lên S3: {ex.Message}");
            }
        }
*/
        #endregion

        #region Update tutorial
        public async Task<string> UpdateTutorialAsync (UpdateTutorialDto updateTutorialDto)
        {
            try
            {
                var tutorial = await _context.Tutorials.FindAsync(updateTutorialDto.TutorialID);
                if (tutorial == null)
                {
                    return "Lỗi: Hướng dẫn không tồn tại";
                }

                tutorial.Title = updateTutorialDto.Title;
                tutorial.Content = updateTutorialDto.Content;
                tutorial.LastUpdate = DateTime.Now;

                _context.Tutorials.Update(tutorial);
                await _context.SaveChangesAsync();

                return "Cập nhật hướng dẫn thành công";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
        }
        #endregion

        #region Delete tutorial
        public async Task<string> DeleteTutorialAsync(int tutorialID)
        {
            try
            {
                var exsistTutor = await _context.Tutorials.FindAsync(tutorialID);
                if (exsistTutor != null)
                {
                    _context.Tutorials.Remove(exsistTutor);
                    await _context.SaveChangesAsync();
                    return "Xóa hướng dẫn thành công";
                }
                return "Hướng dẫn không tồn tại";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }

        #endregion
    }
}
