using Amazon.S3;
using Amazon.S3.Model;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class BannerManagementRepository : IBannerManagementRepository
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;
        private readonly string _containerBannerImg;
        public BannerManagementRepository(
            IConfiguration config,
            AppDbContext context,
            IAmazonS3 s3Client)
        {
            _config = config;
            _context = context;
            _s3Client = s3Client;
            _bucketName = _config["BucketName"];
            _containerBannerImg = _config["ContainerBannerImg"];
        }

        #region Get banners
        public async Task<List<Banner>> GetBannersAsync()
        {
            return await _context.HomepageBanners.ToListAsync();
        }
        #endregion

        public async Task<string> AddBannerAsync(AddBannerRequest addBannerRequest)
        {
            try
            {
                var fileName = $"banner-{Guid.NewGuid()}{Path.GetExtension(addBannerRequest.BannerImg.FileName)}";
                string imageUrl = await UploadFileToS3(addBannerRequest.BannerImg, _containerBannerImg, fileName);

                var newBanner = new Banner
                {
                    ImageUrl = imageUrl,
                    Link = addBannerRequest.Link,
                    OrderIndex = addBannerRequest.OrderIndex,
                    IsActive = true // Mặc định banner mới là active
                };

                _context.HomepageBanners.Add(newBanner);
                await _context.SaveChangesAsync();

                return "Đăng tải banner thành công";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
        }


        public async Task<string> UpdateBannerAsync(int bannerID, IFormFile BannerImg)
        {
            return "Cập nhật banner thành công";
        }

        public async Task<string> DeleteBannerAsync(string fileUrl)
        {
            return "Xóa banner thành công";
        }

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
    }
}
