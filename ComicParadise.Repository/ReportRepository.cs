using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using ComicParadise.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;
        public readonly IConfiguration _config;
        private readonly INotificationRepository _notificationRepository;
        public ReportRepository(
            AppDbContext context,
            IConfiguration config,
            INotificationRepository notificationRepository
            )
        {
            _config = config;
            _context = context;
            _notificationRepository = notificationRepository;
        }

        #region Create report
        public async Task<string> CreateReportAsync(ReportDto reportDto)
        {
            var adminID = await _context.Users
                .Where(u => u.Role == "Admin")
                .Select(u => u.UserID)
                .FirstAsync();

            string link = "";
            string content = "";

            if (reportDto.TargetType == "ReportComment")
            {
                var comment = await _context.Comments.FirstAsync(c => c.CommentID == reportDto.TargetID);
                var story = await _context.Stories.FirstAsync(s => s.StoryID == comment.StoryID);

                link = $"/infor-story/{story.StoryID}?commentID={reportDto.TargetID}";
                content = $"Bình luận của truyện '{story.Title}' đã bị báo cáo bởi user {reportDto.CreatedBy}. \nLý do: {reportDto.Reason}";
            }
            else if (reportDto.TargetType == "ReportStory")
            {
                var story = await _context.Stories
                    .FirstAsync(s => s.StoryID == reportDto.TargetID);

                link = $"/infor-story/{reportDto.TargetID}";
                content = $"Truyện '{story.Title}' đã bị báo cáo bởi user {reportDto.CreatedBy}. \nLý do: {reportDto.Reason}";
            }

            Report report = new Report
            {
                TargetType = reportDto.TargetType,
                TargetID = reportDto.TargetID,
                Reason = reportDto.Reason,
                CreatedBy = reportDto.CreatedBy
                // Bỏ thuộc tính Link vì đã xoá khỏi database
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            /* Create notification */
            var notificationDto = new CreateNotificationDto
            {
                SenderId = reportDto.CreatedBy,
                ReceiverId = adminID,
                Content = content,
                Type = reportDto.TargetType,
                Link = link
            };

            var notificationResult = await _notificationRepository.CreateNotificationAsync(notificationDto);
            if (!notificationResult.Contains("thành công"))
            {
                return $"Lỗi khi tạo thông báo: {notificationResult}";
            }

            return "Báo cáo thành công";
        }


        #endregion

        #region Get report
        public async Task<List<dynamic>> GetReportAsync(string reportType)
        {
            if (reportType == "ReportComment")
            {
                var result = await (from r in _context.Reports
                                    join c in _context.Comments on r.TargetID equals c.CommentID
                                    join u in _context.Users on r.CreatedBy equals u.UserID
                                    where r.TargetType == reportType
                                    select new
                                    {

                                        ReportID = r.ReportID,
                                        TargetType = reportType,
                                        TargetID = c.CommentID,
                                        StoryID = c.StoryID,
                                        CreatedBy = u.Username,
                                        Reason = r.Reason,
                                        CommentContent = c.Content,
                                        CreatedAt = r.CreatedAt
                                    }).ToListAsync<dynamic>();
                return result;

            }
            else
            {
                var result = await (from r in _context.Reports
                                    join s in _context.Stories on r.TargetID equals s.StoryID
                                    join u in _context.Users on r.CreatedBy equals u.UserID
                                    where r.TargetType == reportType
                                    select new
                                    {

                                        ReportID = r.ReportID,
                                        TargetType = reportType,
                                        TargetID = s.StoryID,
                                        CreatedBy = u.Username,
                                        Reason = r.Reason,
                                        CreatedAt = r.CreatedAt
                                    }).ToListAsync<dynamic>();
                return result;
            }
        }
        #endregion
    }
}
