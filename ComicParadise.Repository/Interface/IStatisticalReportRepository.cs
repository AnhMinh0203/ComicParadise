using ComicParadise.DataContext.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface IStatisticalReportRepository
    {
        Task<List<ReportStoryDto>> GetReportStoryInforAsync();
        Task<List<ReportStoryDto>> SearchStoryForReportAsync(string? title);
        Task<byte[]> ExportReportStoryExcelAsync();
        Task<int> getTotalCategoriesAsync();
        Task<int> getTotalMembersAsync();
        Task<int> getTotalStoryAsync();
        Task<List<ChartReportDto>> GetStoryReportForChartAsync(string type);
        Task<List<ChartReportDto>> GetMemberReportForChartAsync(string type);
        Task<byte[]> ExportReportMemberExcelAsync();
    }
}
