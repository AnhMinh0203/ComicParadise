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
            Report report = new Report
            {
                TargetType = reportDto.TargetType,
                TargetID = reportDto.TargetID,
                Reason = reportDto.Reason,
                CreatedBy = reportDto.CreatedBy

            };
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            var adminID = await _context.Users
            .Where(u => u.Role == "Admin")
            .Select(u => u.UserID)
            .FirstAsync();

            /* Create notification */
            if (report.TargetType == "ReportComment")
            {
                var comment = await _context.Comments
                .FirstAsync(c => c.CommentID == reportDto.TargetID);

                var story = await _context.Stories
                .FirstAsync(s => s.StoryID == comment.StoryID);

                var notificationDto = new CreateNotificationDto
                {
                    SenderId = reportDto.CreatedBy,
                    ReceiverId = adminID,
                    Content = $"Bình luận của truyện '{story.Title}' đã bị báo cáo bởi user {reportDto.CreatedBy}. \nLý do: {reportDto.Reason}",
                    Type = report.TargetType,
                    Link = $"/infor-story/{story.StoryID}?commentID={reportDto.TargetID}" 
                };
                var notificationResult = await _notificationRepository.CreateNotificationAsync(notificationDto);
                if (!notificationResult.Contains("thành công"))
                {
                    return $"Lỗi khi tạo thông báo: {notificationResult}";
                }
            }
            else if (reportDto.TargetType == "ReportStory")
            {
                var story = await _context.Stories
                .FirstAsync(s => s.StoryID == reportDto.TargetID);

                var notificationDto = new CreateNotificationDto
                {
                    SenderId = reportDto.CreatedBy,
                    ReceiverId = adminID,
                    Content = $"Truyện '{story.Title}' đã bị báo cáo bởi user {reportDto.CreatedBy}. Lý do: {reportDto.Reason}",
                    Type = report.TargetType,
                    Link = $"/stories/{reportDto.TargetID}" 
                };
                var notificationResult = await _notificationRepository.CreateNotificationAsync(notificationDto);
                if (!notificationResult.Contains("thành công"))
                {
                    return $"Lỗi khi tạo thông báo: {notificationResult}";
                }
            }

            return "Báo cáo thành công";
        }
        #endregion
    }
}
