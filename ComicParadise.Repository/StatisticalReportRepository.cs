using Azure.Storage.Blobs;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
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
    public class StatisticalReportRepository : IStatisticalReportRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public StatisticalReportRepository(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        #region Get report story
        public async Task<List<ReportStoryDto>> GetReportStoryInforAsync()
        {
            var stories = await (from s in _context.Stories
                                 join c in _context.Chapters on s.StoryID equals c.StoryID
                                 select new ReportStoryDto
                                 {
                                     StoryID = s.StoryID,
                                     Title = s.Title,
                                     Views = s.Views,
                                     Likes = s.Likes,
                                     CreatedAt = s.CreatedAt,
                                     TotalChapter = _context.Chapters.Count(c => c.StoryID == s.StoryID) // Đếm số chương
                                 }).ToListAsync();

            return stories;
        }
        #endregion

        #region Search report story
        public async Task<List<ReportStoryDto>> SearchStoryForReportAsync(string? title)
        {
            try
            {
                if (string.IsNullOrEmpty(title))
                {
                    return await GetReportStoryInforAsync();
                }

                var stories = await (from s in _context.Stories
                                     join c in _context.Chapters on s.StoryID equals c.StoryID
                                     where s.Title.Contains(title)
                                     select new ReportStoryDto
                                     {
                                         StoryID = s.StoryID,
                                         Title = s.Title,
                                         Views = s.Views,
                                         Likes = s.Likes,
                                         CreatedAt = s.CreatedAt,
                                         TotalChapter = _context.Chapters.Count(c => c.StoryID == s.StoryID)
                                     }).ToListAsync();

                return stories;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion

        #region Export story report excel
        public async Task<byte[]> ExportReportStoryExcelAsync()
        {
            var stories = await (from s in _context.Stories
                                 join c in _context.Chapters on s.StoryID equals c.StoryID
                                 select new ReportStoryDto
                                 {
                                     StoryID = s.StoryID,
                                     Title = s.Title,
                                     Views = s.Views,
                                     Likes = s.Likes,
                                     CreatedAt = s.CreatedAt,
                                     TotalChapter = _context.Chapters.Count(c => c.StoryID == s.StoryID)
                                 }).ToListAsync();

            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "templates", "StoryReportTemplate.xlsx");

            if (!System.IO.File.Exists(templatePath))
            {
                throw new FileNotFoundException("Không tìm thấy file mẫu Excel.");
            }
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(new FileInfo(templatePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];

                int startRow = 4;
                for (int i = 0; i < stories.Count; i++)
                {
                    var story = stories[i];
                    worksheet.Cells[startRow + i, 1].Value = story.StoryID;
                    worksheet.Cells[startRow + i, 2].Value = story.Title;
                    worksheet.Cells[startRow + i, 3].Value = story.TotalChapter;
                    worksheet.Cells[startRow + i, 4].Value = story.Views;
                    worksheet.Cells[startRow + i, 5].Value = story.Likes;
                    worksheet.Cells[startRow + i, 6].Value = story.CreatedAt;
                    worksheet.Cells[startRow + i, 6].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                return package.GetAsByteArray();
            }

        }
        #endregion

        #region Get total stories
        public async Task<int> getTotalStoryAsync()
        {
            var totalStory = await _context.Stories.CountAsync();
            return totalStory;
        }
        #endregion

        #region Get total members
        public async Task<int> getTotalMembersAsync()
        {
            var totalStory = await _context.Users.CountAsync();
            return totalStory;
        }
        #endregion

        #region Get total categoris
        public async Task<int> getTotalCategoriesAsync()
        {
            var totalStory = await _context.Categories.CountAsync();
            return totalStory;
        }
        #endregion

        #region Get story report for chart
        public async Task<List<ChartReportDto>> GetStoryReportForChartAsync(string type)
        {
            IQueryable<Story> query = _context.Stories;

            IQueryable<ChartReportDto> resultQuery;

            switch (type.ToLower())
            {
                case "month":
                    resultQuery = query
                        .GroupBy(s => s.CreatedAt.Month)
                        .Select(g => new ChartReportDto
                        {
                            Label = "Tháng " + g.Key,
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số tháng
                    break;

                case "quarter":
                    resultQuery = query
                        .GroupBy(s => (s.CreatedAt.Month - 1) / 3 + 1)
                        .Select(g => new ChartReportDto
                        {
                            Label = "Q" + g.Key,
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số quý
                    break;

                case "year":
                    resultQuery = query
                        .GroupBy(s => s.CreatedAt.Year)
                        .Select(g => new ChartReportDto
                        {
                            Label = g.Key.ToString(),
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số năm
                    break;

                default:
                    throw new ArgumentException("Loại báo cáo không hợp lệ. Vui lòng chọn 'month', 'quarter', hoặc 'year'.");
            }

            return await resultQuery.ToListAsync();
        }




        #endregion

        #region Get member report for chart
        public async Task<List<ChartReportDto>> GetMemberReportForChartAsync(string type)
        {
            IQueryable<User> query = _context.Users;

            IQueryable<ChartReportDto> resultQuery;

            switch (type.ToLower())
            {
                case "month":
                    resultQuery = query
                        .GroupBy(s => s.CreatedAt.Month)
                        .Select(g => new ChartReportDto
                        {
                            Label = "Tháng " + g.Key,
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số tháng
                    break;

                case "quarter":
                    resultQuery = query
                        .GroupBy(s => (s.CreatedAt.Month - 1) / 3 + 1)
                        .Select(g => new ChartReportDto
                        {
                            Label = "Q" + g.Key,
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số quý
                    break;

                case "year":
                    resultQuery = query
                        .GroupBy(s => s.CreatedAt.Year)
                        .Select(g => new ChartReportDto
                        {
                            Label = g.Key.ToString(),
                            Count = g.Count()
                        })
                        .OrderBy(g => g.Label); // Sắp xếp theo số năm
                    break;

                default:
                    throw new ArgumentException("Loại báo cáo không hợp lệ. Vui lòng chọn 'month', 'quarter', hoặc 'year'.");
            }

            return await resultQuery.ToListAsync();
        }
        #endregion

        #region Export meber report excel
        public async Task<byte[]> ExportReportMemberExcelAsync()
        {
            var users = await _context.Users.ToListAsync();

            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "templates", "MemberReportTemplate.xlsx");

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
                    worksheet.Cells[startRow + i, 2].Value = user.Username;
                    worksheet.Cells[startRow + i, 3].Value = user.Email;
                    worksheet.Cells[startRow + i, 4].Value = user.Phone;
                    worksheet.Cells[startRow + i, 5].Value = user.Role;
                    worksheet.Cells[startRow + i, 6].Value = user.CreatedAt;
                    worksheet.Cells[startRow + i, 6].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                return package.GetAsByteArray();
            }

        }
        #endregion
    }
}
