using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
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
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string? _containerMangaStory;
        public ChapterRepository(AppDbContext context, IConfiguration config, BlobServiceClient blobServiceClient)
        {
            _context = context;
            _config = config;
            _blobServiceClient = blobServiceClient;
            _containerMangaStory = _config["ContainerMangaStory"];
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

        #region Post chapter
        public async Task<string> PostChapterAsync(PostChapterDto chapterDto)
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
        }
        #endregion

        #region Get chapter content
        public async Task<ChapterContentDto?> GetChapterContentAsync(int storyID, int chapterNumber)
        {
            var chapter = await _context.Chapters
                                .Where(c => c.StoryID == storyID && c.ChapterNumber == chapterNumber)
                                .FirstOrDefaultAsync();
            if (chapter == null)
            {
                return null;
            }
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

        #region Get chapter by storyID
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

        #region Delete chapter page
        public async Task<string> DeleteChapterPageAsync(int storyID, int chapterNumber, int chapterPage)
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
        }
        #endregion

        #region Replace chapter page 
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

        public async Task<string> ReplaceChapterPageAsync(ChapterPageRequest request)
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
        }
        #endregion

        #region Add chapter page
        public async Task<string> AddChapterPageAsync(ChapterPageRequest request)
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
        }
        #endregion
    }
}
