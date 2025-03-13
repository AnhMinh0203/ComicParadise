using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string? _containerAvatar;

        public MemberRepository(AppDbContext context, IConfiguration config, BlobServiceClient blobServiceClient)
        {
            _config = config;
            _context = context;
            _blobServiceClient = blobServiceClient;
            _containerAvatar = _config["ContainerAvatar"];
        }

        #region Get all members
        public async Task<List<User>> GetAllMembersAsync()
        {
            List<User> users = await _context.Users.ToListAsync();
            return users;
        }
        #endregion

        #region Add member
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
                    Status = addMemberDto.Status,
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

        #region Update member 
        public async Task<string> UpdateMemberAsync(UpdateMemberDto user)
        {
            try
            {
                var exsistUser = await _context.Users.FirstOrDefaultAsync(u => u.UserID == user.UserID);
                if (exsistUser == null)
                {
                    return "Lỗi: Thành viên không tồn tại";
                }

                if (!string.IsNullOrEmpty(exsistUser.Username) && exsistUser.Username != user.Username)
                {
                    exsistUser.Username = user.Username;
                }
                if (!string.IsNullOrEmpty(exsistUser.Email) && exsistUser.Email != user.Email)
                {
                    exsistUser.Email = user.Email;
                }
                if (!string.IsNullOrEmpty(exsistUser.Phone) && exsistUser.Phone != user.Phone)
                {
                    exsistUser.Phone = user.Phone;
                }
                if (!string.IsNullOrEmpty(exsistUser.Role) && exsistUser.Role != user.Role)
                {
                    exsistUser.Role = user.Role;
                }
                if (user.IsComment.HasValue &&  exsistUser.IsComment != user.IsComment)
                {
                    exsistUser.IsComment = user.IsComment;
                }
                if (user.IsLock.HasValue &&  exsistUser.IsLock != user.IsLock)
                {
                    exsistUser.IsLock = user.IsLock;
                }
                if (user.PasswordHash != null)
                {
                    string salt = BCrypt.Net.BCrypt.GenerateSalt();
                    string hash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash, salt);
                    exsistUser.PasswordHash = hash;
                }


                if (user.Avatar != null && user.Avatar.Length > 0)
                {
                    var containerCoverImg = _blobServiceClient.GetBlobContainerClient(_containerAvatar);
                    if (!string.IsNullOrEmpty(exsistUser.Avatar))
                    {
                        string oldBlobName = Path.GetFileName(new Uri(exsistUser.Avatar).AbsolutePath);
                        var oldBlobClient = containerCoverImg.GetBlobClient(oldBlobName);
                        var result = await oldBlobClient.DeleteIfExistsAsync();
                    }
                    string newCoverImageUrl = await UploadFileToAzure(user.Avatar, containerCoverImg);
                    exsistUser.Avatar = newCoverImageUrl;
                }
                await _context.SaveChangesAsync();
                return "Cập nhật thông tin thành công";
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
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
        }
        #endregion

        #region Get story history of member
        public Task<IQueryable<ReadingHistoryDTO>> GetReadingHistoryAsync(int userID)
        {
            var result = from s in _context.Stories
                                join rh in _context.ReadingHistories on s.StoryID equals rh.StoryID
                                where rh.UserID == userID
                                select new ReadingHistoryDTO { 
                                    StoryID = s.StoryID,
                                    Title = s.Title,
                                    CoverImage = s.CoverImage,
                                    Views = s.Views,
                                    LastReadAt = rh.LastReadAt,
                                };
            return Task.FromResult(result);
        }
        #endregion

        #region Delete member 
        public async Task<string> DeleteMemberAsync (int userID)
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
