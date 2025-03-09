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
        public async Task<ChapterContentDto?> GetChapterContentAsync(int storyID, int chapterID)
        {
            var chapter = await _context.Chapters
                                .Where(c => c.StoryID == storyID && c.ChapterID == chapterID)
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
    }
}
