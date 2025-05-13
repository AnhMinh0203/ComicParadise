using Amazon.S3;
using Amazon.S3.Model;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class ChapterRepository : IChapterRepository
    {
        private readonly AppDbContext _context;
        public readonly IConfiguration _config;
        //private readonly BlobServiceClient _blobServiceClient;
        private readonly string? _containerMangaStory;
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;
        private readonly INotificationRepository _notificationRepository;
        public ChapterRepository(
            AppDbContext context,
            IConfiguration config,
            //BlobServiceClient blobServiceClient,
            IAmazonS3 s3Client,
            INotificationRepository notificationRepository)
        {
            _context = context;
            _config = config;
            //_blobServiceClient = blobServiceClient;
            _containerMangaStory = _config["ContainerMangaStory"];
            _s3Client = s3Client;
            _bucketName = _config["BucketName"];
            _notificationRepository = notificationRepository;
        }

        #region Get next chapter number
        public async Task<int> GetNextChapterNumberAsync(int storyID)
        {
            var maxChapter = await _context.Chapters
                                    .Where(c => c.StoryID == storyID)
                                    .DefaultIfEmpty()
                                    .Select(c => (int?)c.ChapterNumber).MaxAsync() ?? 0;
            return maxChapter + 1;
        }
        #endregion

        #region Post chapter (Azure)
        /*public async Task<string> PostChapterAsync(PostChapterDto chapterDto)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerMangaStory);
            await containerClient.CreateIfNotExistsAsync();

            string chapterType = chapterDto.ChapterType;
            string blobPrefix = $"{chapterDto.StoryID}/{chapterDto.ChapterNumber}/";

            if (chapterType == "PDF")
            {
                string pdfFileName = "chapter.pdf";
                string blobName = blobPrefix + pdfFileName;
                var blobClient = containerClient.GetBlobClient(blobName);

                using (var stream = chapterDto.PdfFile.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, true);
                }

                var chapter = new Chapter
                {
                    StoryID = chapterDto.StoryID,
                    ChapterNumber = chapterDto.ChapterNumber,
                    Title = chapterDto.Title,
                    ChapterType = "PDF",
                    SourceUrl = blobName
                };
                _context.Chapters.Add(chapter);
                await _context.SaveChangesAsync();

                return blobClient.Uri.ToString();
            }
            else if (chapterType == "Images")
            {
                // Xử lý nhiều ảnh
                var chapter = new Chapter
                {
                    StoryID = chapterDto.StoryID,
                    ChapterNumber = chapterDto.ChapterNumber,
                    Title = chapterDto.Title,
                    ChapterType = "Images",
                    SourceUrl = null
                };
                _context.Chapters.Add(chapter);
                await _context.SaveChangesAsync(); // Lưu chapter để lấy ID

                int order = 1;
                foreach (var imageFile in chapterDto.ImageFiles)
                {
                    // Tạo tên file ảnh duy nhất
                    string imageFileName = $"page{order}-{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                    string blobName = blobPrefix + imageFileName;
                    var blobClient = containerClient.GetBlobClient(blobName);



                    // Tải ảnh lên Blob Storage
                    using (var stream = imageFile.OpenReadStream())
                    {
                        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = imageFile.ContentType });
                    }
                    // Lưu vào bảng ChapterImage
                    var chapterImage = new ChapterImage
                    {
                        ChapterId = chapter.ChapterID,
                        ImagePath = blobClient.Uri.ToString(),
                        Order = order
                    };
                    _context.ChapterImages.Add(chapterImage);
                    order++;
                }
                await _context.SaveChangesAsync();

                return "Chapter với nhiều ảnh đã được đăng tải thành công";
            }

            return "Loại ảnh không hợp lệ";
        }*/
        #endregion

        #region Post chapter (AWS)
        public async Task<string> PostChapterAsync(PostChapterDto chapterDto)
        {
            try
            {
                string chapterType = chapterDto.ChapterType;
                string blobPrefix = $"{_containerMangaStory}/{chapterDto.StoryID}/{chapterDto.ChapterNumber}"; // Ví dụ: "manga/123/1/"

                if (chapterType == "PDF")
                {
                    string pdfFileName = "chapter.pdf";
                    string blobName = pdfFileName;
                    string pdfUrl = await UploadFileToS3(chapterDto.PdfFile, blobPrefix, blobName);

                    var chapter = new Chapter
                    {
                        StoryID = chapterDto.StoryID,
                        ChapterNumber = chapterDto.ChapterNumber,
                        Title = chapterDto.Title,
                        ChapterType = "PDF",
                        SourceUrl = pdfUrl
                    };
                    _context.Chapters.Add(chapter);
                    await _context.SaveChangesAsync();

                    return pdfUrl;
                }
                else if (chapterType == "Images")
                {
                    // Xử lý nhiều ảnh
                    var chapter = new Chapter
                    {
                        StoryID = chapterDto.StoryID,
                        ChapterNumber = chapterDto.ChapterNumber,
                        Title = chapterDto.Title,
                        ChapterType = "Images",
                        SourceUrl = null
                    };
                    _context.Chapters.Add(chapter);
                    await _context.SaveChangesAsync();

                    int order = 1;
                    foreach (var imageFile in chapterDto.ImageFiles)
                    {
                        // Tạo tên file ảnh duy nhất
                        string imageFileName = $"page{order}-{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                        string imageUrl = await UploadFileToS3(imageFile, blobPrefix, imageFileName);

                        // Lưu vào bảng ChapterImage
                        var chapterImage = new ChapterImage
                        {
                            ChapterId = chapter.ChapterID,
                            ImagePath = imageUrl,
                            Order = order
                        };
                        _context.ChapterImages.Add(chapterImage);
                        order++;
                    }
                    await _context.SaveChangesAsync();

                    // Tạo thông báo
                    string storyTitle = await _context.Stories.Where(s => s.StoryID == chapterDto.StoryID)
                        .Select(s => s.Title).FirstAsync();
                    var notificationDto = new CreateNotificationDto
                    {
                        SenderId = chapterDto.CreatedBy,
                        TargetID = chapter.StoryID,
                        Content = $"Chương {chapter.ChapterNumber} của truyện '{storyTitle}' đã được đăng!",
                        Type = "NewChapter",
                        Link = $"/chapter-content/{chapter.StoryID}/{chapter.ChapterNumber}"
                    };
                    var notificationResult = await _notificationRepository.CreateNotificationAsync(notificationDto);
                    if (!notificationResult.Contains("thành công"))
                    {
                        throw new Exception($"Lỗi khi tạo thông báo: {notificationResult}");
                    }

                    return "Chapter với nhiều ảnh đã được đăng tải thành công";
                }

                return "Loại ảnh không hợp lệ";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi upload file lên S3: {s3Ex.Message}";
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
                var key = $"{prefix}/{fileName}"; // Ví dụ: "manga/123/1/chapter.pdf"

                using var stream = file.OpenReadStream();
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType,
                    Headers = { CacheControl = "no-store, no-cache, must-revalidate" }
                    // Xóa CannedACL vì bucket không cho phép ACLs
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
        #endregion

        #region Get chapter content
        public async Task<ChapterContentDto?> GetChapterContentAsync(int storyID, int chapterNumber, int? userID)
        {


            var chapter = await _context.Chapters
                                .Where(c => c.StoryID == storyID && c.ChapterNumber == chapterNumber)
                                .FirstOrDefaultAsync();
            if (chapter == null)
            {
                return null;
            }

            /* Cập nhật view */
            var story = await _context.Stories.FirstOrDefaultAsync(s => s.StoryID == storyID);
            if (story == null)
            {
                return null;
            }
            story.Views += 1;

            /* Tạo lịch sử */
            if(userID != null)
            {
                var readingHistory = new ReadingHistory
                {
                    UserID = userID,
                    StoryID = storyID,
                    LastReadAt = DateTime.Now
                };
                _context.ReadingHistories.Add(readingHistory);
            }
            
            await _context.SaveChangesAsync();

            ChapterContentDto chapterContentDto = new ChapterContentDto();
            chapterContentDto.ChapterType = chapter.ChapterType;

            if (chapterContentDto.ChapterType == "PDF")
            {
                chapterContentDto.PdfUrl = chapter.SourceUrl;
            }
            else
            {
                chapterContentDto.ImageUrls = await (from ci in _context.ChapterImages
                                                     where ci.ChapterId == chapter.ChapterID
                                                     orderby ci.Order
                                                     select ci.ImagePath).ToListAsync();
            }
            return chapterContentDto;
        }

        #endregion

        #region Get chapter infor by storyID
        public async Task<List<Chapter>> GetChaptersByStoryIDAsync(int storyID)
        {
            var charters = await (from c in _context.Chapters
                                  where c.StoryID == storyID
                                  orderby c.ChapterNumber ascending
                                  select c).ToListAsync();
            return charters;
        }
        #endregion

        #region Get chapter by page number
        public async Task<string> GetChapterPageByPageNumberAsync(int storyID, int chapterID, int pageNumber)
        {
            var chapter = await _context.Chapters
                                .FirstOrDefaultAsync(c => c.StoryID == storyID && c.ChapterID == chapterID);
            if (chapter == null)
            {
                throw new Exception("Lỗi: Chapter không tồn tại");
            }
            var targetPage = await (from ci in _context.ChapterImages
                                    where ci.ChapterId == chapter.ChapterID && ci.Order == pageNumber
                                    select ci.ImagePath).FirstOrDefaultAsync();
            if (targetPage == null)
            {
                throw new Exception("Lỗi: Trang tìm kiếm không tồn tại");
            }
            return targetPage;
        }
        #endregion

        #region Delete chapter page (Azure)
        /*public async Task<string> DeleteChapterPageAsync(int storyID, int chapterNumber, int chapterPage)
        {
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.StoryID == storyID && c.ChapterNumber == chapterNumber);

            if (chapter == null)
            {
                throw new Exception($"Chapter với StoryID {storyID} và ChapterNumber {chapterNumber} không tồn tại.");
            }

            var chapterImage = await _context.ChapterImages
                .FirstOrDefaultAsync(ci => ci.ChapterId == chapter.ChapterID && ci.Order == chapterPage);

            if (chapterImage == null)
            {
                throw new Exception($"Trang {chapterPage} không tồn tại trong chapter {chapterNumber} của story {storyID}.");
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerMangaStory);

            // Trích xuất tên blob từ URL đầy đủ
            string absolutePath = new Uri(chapterImage.ImagePath).AbsolutePath; // "/manga/1009/71/page4-..."
            string blobName = absolutePath.Substring(absolutePath.IndexOf('/', 1) + 1); // Loại bỏ "/manga/" -> "1009/71/page4-..."

            var blobClient = containerClient.GetBlobClient(blobName);
            var deleteResponse = await blobClient.DeleteIfExistsAsync();

            _context.ChapterImages.Remove(chapterImage);
            await _context.SaveChangesAsync();

            var pagesToUpdate = await (from c in _context.ChapterImages
                                       where c.ChapterId == chapter.ChapterID && c.Order > chapterPage
                                       select c).ToListAsync();

            foreach (var page in pagesToUpdate)
            {
                page.Order -= 1;
            }
            await _context.SaveChangesAsync();
            return $"Đã xóa thành công trang {chapterPage} trong chapter {chapterNumber} của story {storyID}";
        }*/
        #endregion

        #region Delete chapter page (AWS)
        public async Task<string> DeleteChapterPageAsync(int storyID, int chapterNumber, int chapterPage)
        {
            try
            {
                var chapter = await _context.Chapters
                    .FirstOrDefaultAsync(c => c.StoryID == storyID && c.ChapterNumber == chapterNumber);

                if (chapter == null)
                {
                    throw new Exception($"Chapter với StoryID {storyID} và ChapterNumber {chapterNumber} không tồn tại.");
                }

                var chapterImage = await _context.ChapterImages
                    .FirstOrDefaultAsync(ci => ci.ChapterId == chapter.ChapterID && ci.Order == chapterPage);

                if (chapterImage == null)
                {
                    throw new Exception($"Trang {chapterPage} không tồn tại trong chapter {chapterNumber} của story {storyID}.");
                }

                // Xóa file trên S3
                if (!string.IsNullOrEmpty(chapterImage.ImagePath))
                {
                    await DeleteFileFromS3(chapterImage.ImagePath);
                }

                // Xóa bản ghi ChapterImage trong database
                _context.ChapterImages.Remove(chapterImage);
                await _context.SaveChangesAsync();

                // Cập nhật thứ tự của các trang còn lại
                var pagesToUpdate = await (from c in _context.ChapterImages
                                           where c.ChapterId == chapter.ChapterID && c.Order > chapterPage
                                           select c).ToListAsync();

                foreach (var page in pagesToUpdate)
                {
                    page.Order -= 1;
                }
                await _context.SaveChangesAsync();

                return $"Đã xóa thành công trang {chapterPage} trong chapter {chapterNumber} của story {storyID}";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi xóa file trên S3: {s3Ex.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
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

        #region Replace chapter page (Azure)
        /*        public async Task<string> ReplaceChapterPageAsync(ChapterPageRequest request)
                {
                    var chapter = await (from c in _context.Chapters
                                         where c.StoryID == request.storyID && c.ChapterNumber == request.chapterNumber
                                         select c).FirstOrDefaultAsync();

                    var chapterImage = await (from ci in _context.ChapterImages
                                              where ci.ChapterId == chapter.ChapterID && ci.Order == request.chapterPage
                                              select ci).FirstOrDefaultAsync();

                    var containerClient = _blobServiceClient.GetBlobContainerClient(_containerMangaStory);
                    string blobPrefix = $"{request.storyID}/{request.chapterNumber}/";
                    string absolutePath = new Uri(chapterImage.ImagePath).AbsolutePath; // "/manga/1009/71/page4-..."
                    string blobName = absolutePath.Substring(absolutePath.IndexOf('/', 1) + 1); // Loại bỏ "/manga/" -> "1009/71/page4-..."
                    var blobClient = containerClient.GetBlobClient(blobName);

                    using (var strem = request.newPage.OpenReadStream())
                    {
                        await blobClient.UploadAsync(strem,
                                                    new BlobHttpHeaders { ContentType = request.newPage.ContentType },
                                                    conditions: null // Cho phép ghi đè nếu blob đã tồn tại
                                                    );
                    }
                    chapterImage.ImagePath = blobClient.Uri.ToString();
                    await _context.SaveChangesAsync();

                    return "Thay trang thành công";
                }*/

        /*public async Task<string> ReplaceChapterPageAsync(ChapterPageRequest request)
        {
            // Tìm chapter và chapterImage
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.StoryID == request.storyID && c.ChapterNumber == request.chapterNumber);
            if (chapter == null)
            {
                throw new Exception("Không tìm thấy chapter.");
            }

            var chapterImage = await _context.ChapterImages
                .FirstOrDefaultAsync(ci => ci.ChapterId == chapter.ChapterID && ci.Order == request.chapterPage);
            if (chapterImage == null)
            {
                throw new Exception("Không tìm thấy trang cần thay thế.");
            }


            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerMangaStory);

            string absolutePath = new Uri(chapterImage.ImagePath).AbsolutePath;
            string blobName = absolutePath;
            if (blobName.StartsWith("/"))
            {
                blobName = blobName.Substring(1);
            }
            if (blobName.StartsWith(_containerMangaStory + "/"))
            {
                blobName = blobName.Substring(_containerMangaStory.Length + 1);
            }
            else
            {
                throw new InvalidOperationException("Đường dẫn ImagePath không khớp với container.");
            }

            var blobClient = containerClient.GetBlobClient(blobName);
            using (var stream = request.newPage.OpenReadStream())
            {
                await blobClient.UploadAsync(stream,
                    new BlobHttpHeaders { ContentType = request.newPage.ContentType, CacheControl = "no-store, no-cache, must-revalidate" }, // Vô hiệu hóa cache
                    conditions: null // Cho phép ghi đè
                );
            }

            return "Thay trang thành công";
        }*/
        #endregion

        #region Replace chapter page (AWS)
        public async Task<string> ReplaceChapterPageAsync(ChapterPageRequest request)
        {
            try
            {
                var chapter = await _context.Chapters
                    .FirstOrDefaultAsync(c => c.StoryID == request.storyID && c.ChapterNumber == request.chapterNumber);
                if (chapter == null)
                {
                    throw new Exception("Không tìm thấy chapter.");
                }

                var chapterImage = await _context.ChapterImages
                    .FirstOrDefaultAsync(ci => ci.ChapterId == chapter.ChapterID && ci.Order == request.chapterPage);
                if (chapterImage == null)
                {
                    throw new Exception("Không tìm thấy trang cần thay thế.");
                }

                var uri = new Uri(chapterImage.ImagePath);
                var key = uri.AbsolutePath.Substring(1); // Bỏ dấu "/" đầu tiên, ví dụ: "manga/123/1/page1-xxx.jpg"

                // Tách prefix và fileName từ key
                var lastSlashIndex = key.LastIndexOf('/');
                if (lastSlashIndex == -1)
                {
                    throw new InvalidOperationException("Đường dẫn ImagePath không hợp lệ.");
                }
                var prefix = key.Substring(0, lastSlashIndex);
                var fileName = key.Substring(lastSlashIndex + 1);

                // Upload file mới lên S3 (ghi đè file cũ)
                await UploadFileToS3(request.newPage, prefix, fileName);

                return "Thay trang thành công";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi upload file lên S3: {s3Ex.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
        }
        #endregion

        #region Add chapter page (Azure)
        /*public async Task<string> AddChapterPageAsync(ChapterPageRequest request)
        {
            // Tìm chapter
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.StoryID == request.storyID && c.ChapterNumber == request.chapterNumber);
            if (chapter == null)
            {
                throw new Exception($"Không tìm thấy chapter với StoryID {request.storyID} và ChapterNumber {request.chapterNumber}.");
            }

            // Tải lên file mới trên Azure Blob Storage
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerMangaStory);
            string blobPrefix = $"{chapter.StoryID}/{chapter.ChapterNumber}/";
            string newImageFileName = $"{Guid.NewGuid()}{Path.GetExtension(request.newPage.FileName)}";
            string newBlobName = blobPrefix + newImageFileName;
            var newBlobClient = containerClient.GetBlobClient(newBlobName);

            using (var stream = request.newPage.OpenReadStream())
            {
                await newBlobClient.UploadAsync(stream, new BlobHttpHeaders
                {
                    ContentType = request.newPage.ContentType,
                    CacheControl = "no-store, no-cache, must-revalidate"
                });
            }

            if (request.chapterPage.HasValue)
            {
                var pagesToShift = await _context.ChapterImages
                    .Where(ci => ci.ChapterId == chapter.ChapterID && ci.Order >= request.chapterPage.Value)
                    .ToListAsync();
                foreach (var page in pagesToShift)
                {
                    page.Order += 1;
                }
            }

            var newChapterImage = new ChapterImage
            {
                ChapterId = chapter.ChapterID,
                Order = request.chapterPage ?? (await _context.ChapterImages.CountAsync(ci => ci.ChapterId == chapter.ChapterID) + 1),
                ImagePath = newBlobClient.Uri.ToString()
            };
            _context.ChapterImages.Add(newChapterImage);
            await _context.SaveChangesAsync();

            return "Thêm trang mới thành công";
        }*/
        #endregion

        #region Add chapter page (AWS)
        public async Task<string> AddChapterPageAsync(ChapterPageRequest request)
        {
            try
            {
                var chapter = await _context.Chapters
                    .FirstOrDefaultAsync(c => c.StoryID == request.storyID && c.ChapterNumber == request.chapterNumber);
                if (chapter == null)
                {
                    throw new Exception($"Không tìm thấy chapter với StoryID {request.storyID} và ChapterNumber {request.chapterNumber}.");
                }

                // Tải lên file mới trên S3
                string blobPrefix = $"{_containerMangaStory}/{chapter.StoryID}/{chapter.ChapterNumber}/"; // Ví dụ: "manga/123/1/"
                string newImageFileName = $"page{request.chapterPage ?? (await _context.ChapterImages.CountAsync(ci => ci.ChapterId == chapter.ChapterID) + 1)}-{Guid.NewGuid()}{Path.GetExtension(request.newPage.FileName)}";
                string newImageUrl = await UploadFileToS3(request.newPage, blobPrefix, newImageFileName);

                // Dịch chuyển các trang hiện có nếu chapterPage được chỉ định
                if (request.chapterPage.HasValue)
                {
                    var pagesToShift = await _context.ChapterImages
                        .Where(ci => ci.ChapterId == chapter.ChapterID && ci.Order >= request.chapterPage.Value)
                        .ToListAsync();
                    foreach (var page in pagesToShift)
                    {
                        page.Order += 1;
                    }
                }

                // Thêm bản ghi ChapterImage mới
                var newChapterImage = new ChapterImage
                {
                    ChapterId = chapter.ChapterID,
                    Order = request.chapterPage ?? (await _context.ChapterImages.CountAsync(ci => ci.ChapterId == chapter.ChapterID) + 1),
                    ImagePath = newImageUrl
                };
                _context.ChapterImages.Add(newChapterImage);
                await _context.SaveChangesAsync();

                return "Thêm trang mới thành công";
            }
            catch (DbUpdateException dbEx)
            {
                return $"Lỗi database: {dbEx.Message}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                return $"Lỗi upload file lên S3: {s3Ex.Message}";
            }
            catch (Exception ex)
            {
                return $"Lỗi hệ thống: {ex.Message}";
            }
        }
        #endregion

        #region Mark chapter
        public async Task<string> ToggleChapterBookmarkAsync(MarkChapterDto markChapterDto)
        {
            try
            {
                var existingBookmark = await _context.BookMarks.FirstOrDefaultAsync(b =>
                    b.StoryID == markChapterDto.StoryID &&
                    b.ChapterNumber == markChapterDto.ChapterNumber &&
                    b.UserID == markChapterDto.UserID
                );

                if(existingBookmark != null)
                {
                    _context.BookMarks.Remove(existingBookmark);
                    await _context.SaveChangesAsync();
                    return "Hủy lưu thành công";
                }
                else
                {
                    var bookMark = await _context.BookMarks.FirstOrDefaultAsync(b =>
                    b.StoryID == markChapterDto.StoryID &&
                    b.UserID == markChapterDto.UserID
                );

                    if (bookMark != null)
                    {
                        _context.BookMarks.Remove(bookMark);
                    }
                    var newBookmark = new BookMark
                    {
                        StoryID = markChapterDto.StoryID,
                        ChapterNumber = markChapterDto.ChapterNumber,
                        UserID = markChapterDto.UserID
                    };

                    _context.BookMarks.Add(newBookmark);
                    await _context.SaveChangesAsync();
                    return "Lưu thành công !";
                }           
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi xử lý bookmark: " + ex.Message);
            }
        }

        #endregion

        #region Check if bookmark
        public async Task<bool> IsChapterBookmarkedAsync(MarkChapterDto markChapterDto)
        {
            return await _context.BookMarks.AnyAsync(b =>
                b.UserID == markChapterDto.UserID &&
                b.StoryID == markChapterDto.StoryID &&
                b.ChapterNumber == markChapterDto.ChapterNumber);
        }

        #endregion

        #region Get mark chapter 
        public async Task<ChapterLinkDto> GetMarkChapterAsync(int userID, int storyID)
        {
            try
            {
                var isExistMarkChapter = await _context.BookMarks
                                    .Where(b => b.StoryID == storyID && b.UserID == userID)
                                    .FirstOrDefaultAsync();

                if (isExistMarkChapter != null)
                {
                    return new ChapterLinkDto
                    { 
                        Link = $"/chapter-content/{storyID}/{isExistMarkChapter.ChapterNumber}",
                        ChapterNumber = isExistMarkChapter.ChapterNumber,
                    };
                }
                else
                {
                    return new ChapterLinkDto { 
                        Link = null,
                        ChapterNumber = 0
                    };
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion
    }
}
