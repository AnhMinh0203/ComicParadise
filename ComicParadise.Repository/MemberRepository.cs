using Amazon.S3;
using Amazon.S3.Model;
using AutoMapper.Execution;
using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class MemberRepository : IMemberRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHubContext<NotificationHub> _hubContext;
        //private readonly BlobServiceClient _blobServiceClient;
        private readonly string? _containerAvatar;
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;

        public MemberRepository(
            AppDbContext context,
            IConfiguration config,
            // BlobServiceClient blobServiceClient,
            IHubContext<NotificationHub> hubContext,
            IAmazonS3 s3Client)
        {
            _config = config;
            _context = context;
            // _blobServiceClient = blobServiceClient;
            _containerAvatar = _config["ContainerAvatar"];
            _hubContext = hubContext;
            _s3Client = s3Client;
            _bucketName = _config["BucketName"];
        }

        #region Get all members
        public async Task<List<User>> GetAllMembersAsync()
        {
            List<User> users = await _context.Users.ToListAsync();
            return users;
        }
        #endregion

        #region Get member by id 
        public async Task<User?> GetMemberById(int userID)
        {
            return await _context.Users.Where(u => u.UserID == userID).FirstOrDefaultAsync();
        }
        #endregion

        #region Add member (Azure)
        /*public async Task<string> AddMemberAsync(AddMemberDto addMemberDto)
        {
            try
            {
                var avtPath = "";
                var checkExsist = await _context.Users
                                        .FirstOrDefaultAsync(u => u.Email == addMemberDto.Email || u.Phone == addMemberDto.Phone);

                if (checkExsist != null)
                {
                    return "Lỗi: Số điện thoại hoặc email đã tồn tại";
                }
                if (addMemberDto.Avatar != null)
                {
                    var containerClient = _blobServiceClient.GetBlobContainerClient(_containerAvatar);
                    string newImageFileName = $"{Guid.NewGuid()}{Path.GetExtension(addMemberDto.Avatar.FileName)}";
                    var blobClient = containerClient.GetBlobClient(newImageFileName);

                    using (var stream = addMemberDto.Avatar.OpenReadStream())
                    {
                        await blobClient.UploadAsync(stream, new BlobHttpHeaders
                        {
                            ContentType = addMemberDto.Avatar.ContentType,
                            CacheControl = "no-store, no-cache, must-revalidate"
                        });
                    }
                    avtPath = blobClient.Uri.ToString();
                }

                string salt = BCrypt.Net.BCrypt.GenerateSalt();
                string hash = BCrypt.Net.BCrypt.HashPassword(addMemberDto.PasswordHash, salt);

                var newUser = new User
                {
                    Username = addMemberDto.Username,
                    Email = addMemberDto.Email,
                    Phone = addMemberDto.Phone,
                    PasswordHash = hash,
                    Role = addMemberDto.Role,
                    CompletionStatus = addMemberDto.CompletionStatus,
                    Avatar = addMemberDto.Avatar != null ? avtPath : null,
                    IsComment = addMemberDto.IsComment,
                    IsLock = addMemberDto.IsLock
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return "Thêm người dùng thành công";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }*/
        #endregion

        #region Add member (AWS)
        public async Task<string> AddMemberAsync(AddMemberDto addMemberDto)
        {
            try
            {
                var avtPath = "";
                var checkExsist = await _context.Users
                                        .FirstOrDefaultAsync(u => u.Email == addMemberDto.Email || u.Phone == addMemberDto.Phone);

                if (checkExsist != null)
                {
                    return "Lỗi: Số điện thoại hoặc email đã tồn tại";
                }

                if (addMemberDto.Avatar != null)
                {
                    // Upload ảnh đại diện lên S3
                    var fileName = $"avatar-{Guid.NewGuid()}{Path.GetExtension(addMemberDto.Avatar.FileName)}";
                    avtPath = await UploadFileToS3(addMemberDto.Avatar, _containerAvatar, fileName);
                }

                string salt = BCrypt.Net.BCrypt.GenerateSalt();
                string hash = BCrypt.Net.BCrypt.HashPassword(addMemberDto.PasswordHash, salt);

                var newUser = new User
                {
                    Username = addMemberDto.Username,
                    Email = addMemberDto.Email,
                    Phone = addMemberDto.Phone,
                    PasswordHash = hash,
                    Role = addMemberDto.Role,
                    Status = addMemberDto.Status,
                    Avatar = addMemberDto.Avatar != null ? avtPath : null,
                    IsComment = addMemberDto.IsComment,
                    IsLock = addMemberDto.IsLock
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return "Thêm người dùng thành công";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi upload ảnh lên S3: {s3Ex.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
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

        #region Export excel
        public async Task<byte[]> ExportExcelAsync()
        {
            var users = await _context.Users.ToListAsync();
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "templates", "UserTemplate.xlsx");

            if (!System.IO.File.Exists(templatePath))
            {
                throw new FileNotFoundException("Không tìm thấy file mẫu Excel.");
            }
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(new FileInfo(templatePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];

                int startRow = 4;
                for (int i = 0; i < users.Count; i++)
                {
                    var user = users[i];
                    worksheet.Cells[startRow + i, 1].Value = user.UserID;
                    worksheet.Cells[startRow + i, 4].Value = user.Username;
                    worksheet.Cells[startRow + i, 2].Value = user.Phone;
                    worksheet.Cells[startRow + i, 3].Value = user.Email;
                    worksheet.Cells[startRow + i, 5].Value = user.Role;
                    worksheet.Cells[startRow + i, 6].Value = user.Status;
                }
                return package.GetAsByteArray();
            }

        }

        #endregion

        #region Update member (Azure)
        /*public async Task<string> UpdateMemberAsync(UpdateMemberDto user)
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserID == user.UserID);
                if (existingUser == null)
                {
                    return "Lỗi: Thành viên không tồn tại";
                }

                // Cập nhật các trường nếu có thay đổi
                if (!string.IsNullOrEmpty(user.Username) && existingUser.Username != user.Username)
                {
                    existingUser.Username = user.Username;
                }
                if (!string.IsNullOrEmpty(user.Email) && existingUser.Email != user.Email)
                {
                    existingUser.Email = user.Email;
                }
                if (!string.IsNullOrEmpty(user.Phone) && existingUser.Phone != user.Phone)
                {
                    existingUser.Phone = user.Phone;
                }
                if (!string.IsNullOrEmpty(user.Role) && existingUser.Role != user.Role)
                {
                    existingUser.Role = user.Role;
                }
                if (user.IsLock.HasValue && existingUser.IsLock != user.IsLock)
                {
                    existingUser.IsLock = user.IsLock;
                }
                if (!string.IsNullOrEmpty(user.PasswordHash))
                {
                    string salt = BCrypt.Net.BCrypt.GenerateSalt();
                    string hash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash, salt);
                    existingUser.PasswordHash = hash;
                }

                // Kiểm tra và xử lý thay đổi trạng thái IsComment
                if (user.IsComment.HasValue && existingUser.IsComment != user.IsComment)
                {
                    existingUser.IsComment = user.IsComment;
                    string message = user.IsComment.Value
                        ? "Quyền bình luận của bạn đã được mở lại."
                        : "Quyền bình luận của bạn đã bị tắt.";

                    // Tạo thông báo
                    var notification = new Notification
                    {
                        SenderId = 1, // Thay bằng ID của admin thực tế (lấy từ HttpContext nếu có auth)
                        ReceiverId = existingUser.UserID,
                        Content = message,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        Type = "CommentStatus",
                        Link = null
                    };
                    _context.Notifications.Add(notification);

                    // Lưu thay đổi để lấy Id của notification
                    await _context.SaveChangesAsync();

                    // Gửi thông báo qua SignalR với dữ liệu đầy đủ
                    await _hubContext.Clients.User(existingUser.UserID.ToString())
                        .SendAsync("ReceiveNotification", notification);
                }
                else
                {
                    // Lưu các thay đổi khác nếu không có thay đổi IsComment
                    await _context.SaveChangesAsync();
                }

                // Xử lý cập nhật Avatar
                if (user.Avatar != null && user.Avatar.Length > 0)
                {
                    var containerCoverImg = _blobServiceClient.GetBlobContainerClient(_containerAvatar);
                    if (!string.IsNullOrEmpty(existingUser.Avatar))
                    {
                        string oldBlobName = Path.GetFileName(new Uri(existingUser.Avatar).AbsolutePath);
                        var oldBlobClient = containerCoverImg.GetBlobClient(oldBlobName);
                        await oldBlobClient.DeleteIfExistsAsync();
                    }
                    string newCoverImageUrl = await UploadFileToAzure(user.Avatar, containerCoverImg);
                    existingUser.Avatar = newCoverImageUrl;
                    // Lưu tất cả thay đổi vào database
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Sending notification to UserID: {existingUser.UserID}");
                }


                return "Cập nhật thông tin thành công";
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết nếu cần (thay vì chỉ ném lại exception)
                throw new Exception("Lỗi khi cập nhật thành viên: " + ex.Message, ex);
            }
        }

        private async Task<string> UploadFileToAzure(IFormFile imgFile, BlobContainerClient containerClient)
        {
            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(imgFile.FileName);
            var blobClient = containerClient.GetBlobClient(fileName);

            using (var stream = imgFile.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = imgFile.ContentType });

            }
            return blobClient.Uri.ToString();
        }*/
        #endregion

        #region Update member (AWS)
        public async Task<string> UpdateMemberAsync(UpdateMemberDto user)
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserID == user.UserID);
                if (existingUser == null)
                {
                    return "Lỗi: Thành viên không tồn tại";
                }

                if (!string.IsNullOrEmpty(user.Username) && existingUser.Username != user.Username)
                {
                    existingUser.Username = user.Username;
                }
                if (!string.IsNullOrEmpty(user.Email) && existingUser.Email != user.Email)
                {
                    existingUser.Email = user.Email;
                }
                if (!string.IsNullOrEmpty(user.Phone) && existingUser.Phone != user.Phone)
                {
                    existingUser.Phone = user.Phone;
                }
                if (!string.IsNullOrEmpty(user.Role) && existingUser.Role != user.Role)
                {
                    existingUser.Role = user.Role;
                }
                if (user.IsLock.HasValue && existingUser.IsLock != user.IsLock)
                {
                    existingUser.IsLock = user.IsLock;
                }
                if (!string.IsNullOrEmpty(user.PasswordHash))
                {
                    string salt = BCrypt.Net.BCrypt.GenerateSalt();
                    string hash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash, salt);
                    existingUser.PasswordHash = hash;
                }

                // Kiểm tra và xử lý thay đổi trạng thái IsComment
                if (user.IsComment.HasValue && existingUser.IsComment != user.IsComment)
                {
                    existingUser.IsComment = user.IsComment;
                    string message = user.IsComment.Value
                        ? "Quyền bình luận của bạn đã được mở lại."
                        : "Quyền bình luận của bạn đã bị tắt.";


                    // Tạo thông báo
                    var notification = new Notification
                    {
                        SenderId = 1,
                        ReceiverId = existingUser.UserID,
                        Content = message,
                        CreatedAt = DateTime.Now,
                        IsRead = false,
                        Type = "CommentStatus",
                        Link = null
                    };
                    _context.Notifications.Add(notification);
                    // Gửi thông báo qua nhóm
                    await _hubContext.Clients.Group(existingUser.UserID.ToString()).SendAsync("ReceiveNotification", notification);
                    Console.WriteLine($"Sent notification to group: {existingUser.UserID}");
                    await _context.SaveChangesAsync();

  
                }
                else
                {
                    // Lưu các thay đổi khác nếu không có thay đổi IsComment
                    await _context.SaveChangesAsync();
                }
                if (user.Avatar != null && user.Avatar.Length > 0)
                {
                    if (!string.IsNullOrEmpty(existingUser.Avatar))
                    {
                        await DeleteFileFromS3(existingUser.Avatar);
                    }
                    var fileName = $"avatar-{Guid.NewGuid()}{Path.GetExtension(user.Avatar.FileName)}";
                    string newAvatarUrl = await UploadFileToS3(user.Avatar, _containerAvatar, fileName);
                    existingUser.Avatar = newAvatarUrl;

                    // Lưu tất cả thay đổi vào database
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Sending notification to UserID: {existingUser.UserID}");
                }

                return "Cập nhật thông tin thành công";
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

        #region Get history of member
        public Task<IQueryable<ReadingHistoryDto>> GetReadingHistoryAsync(int userID)
        {
            var result = from s in _context.Stories
                         join rh in _context.ReadingHistories on s.StoryID equals rh.StoryID
                         where rh.UserID == userID
                         select new ReadingHistoryDto
                         {
                             StoryID = s.StoryID,
                             Title = s.Title,
                             CoverImage = s.CoverImage,
                             Views = s.Views,
                             LastReadAt = rh.LastReadAt,
                         };
            return Task.FromResult(result.Distinct());
        }
        #endregion

        #region Get history of member by range
        public Task<IQueryable<ReadingHistoryDto>> GetReadingHistoryByRangeAsync(int userID, string range)
        {
            DateTime startDate = DateTime.MinValue;

            if (range == "30days")
                startDate = DateTime.UtcNow.AddDays(-30);
            else if (range == "7days")
                startDate = DateTime.UtcNow.AddDays(-7);

            var result = (from s in _context.Stories
                          join rh in _context.ReadingHistories on s.StoryID equals rh.StoryID
                          where rh.UserID == userID && (range == "all" || rh.LastReadAt >= startDate)
                          select new ReadingHistoryDto
                          {
                              StoryID = s.StoryID,
                              Title = s.Title,
                              CoverImage = s.CoverImage,
                              Views = s.Views,
                              LastReadAt = rh.LastReadAt,
                          })
                         .GroupBy(rh => rh.StoryID)  // Nhóm theo StoryID
                         .Select(g => g.OrderByDescending(x => x.LastReadAt).FirstOrDefault()) // Chọn lần đọc gần nhất
                         .AsQueryable();

            return Task.FromResult(result);
        }
        #endregion



        #region Delete member 
        public async Task<string> DeleteMemberAsync(int userID)
        {
            var member = await _context.Users.FirstOrDefaultAsync(x => x.UserID == userID);
            if (member == null)
            {
                return "Thành viên không tồn tại";
            }
            _context.Users.Remove(member);
            await _context.SaveChangesAsync();
            return "Xóa thành viên thành công";
        }
        #endregion

    }
}
