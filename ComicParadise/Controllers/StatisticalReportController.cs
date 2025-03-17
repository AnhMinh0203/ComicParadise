using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticalReportController : ControllerBase
    {
        private readonly IStatisticalReportRepository _statisticalReportRepository;
        public StatisticalReportController(IStatisticalReportRepository statisticalReportRepository)
        {
            _statisticalReportRepository = statisticalReportRepository;
        }


        [HttpGet("Get-report-story")]
        public async Task<ActionResult> GetReportStoryInfor()
        {
            var result = await _statisticalReportRepository.GetReportStoryInforAsync();
            return Ok(new BaseResponse<List<ReportStoryDto>>(true, result));
        }

        [HttpGet("Search-report-story")]
        public async Task<ActionResult> SearchReportStoryInfor(string? title)
        {
            var result = await _statisticalReportRepository.SearchStoryForReportAsync(title);
            return Ok(new BaseResponse<List<ReportStoryDto>>(true, result));
        }

        [HttpGet("Export-report-story-excel")]
        public async Task<ActionResult> ExportStoryReportExcel()
        {
            var result = await _statisticalReportRepository.ExportReportStoryExcelAsync();
            string fileName = $"StoryReport-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(result, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("Get-total-stories")]
        public async Task<ActionResult> TotalStories()
        {
            var result = await _statisticalReportRepository.getTotalStoryAsync();
            return Ok(new BaseResponse<int>(true, result));
        }

        [HttpGet("Get-total-members")]
        public async Task<ActionResult> TotalMembers()
        {
            var result = await _statisticalReportRepository.getTotalMembersAsync();
            return Ok(new BaseResponse<int>(true, result));
        }

        [HttpGet("Get-total-categories")]
        public async Task<ActionResult> TotalCategoris()
        {
            var result = await _statisticalReportRepository.getTotalCategoriesAsync();
            return Ok(new BaseResponse<int>(true, result));
        }

        [HttpGet("Get-chart-story-report")]
        public async Task<ActionResult> GetChartStoryReport (string type)
        {
            var result = await _statisticalReportRepository.GetStoryReportForChartAsync(type);
            return Ok(new BaseResponse<List<ChartReportDto>>(true, result));
        }

        [HttpGet("Get-chart-member-report")]
        public async Task<ActionResult> GetChartMemberReport(string type)
        {
            var result = await _statisticalReportRepository.GetMemberReportForChartAsync(type);
            return Ok(new BaseResponse<List<ChartReportDto>>(true, result));
        }

        [HttpGet("Export-report-member-excel")]
        public async Task<ActionResult> ExportMemberReportExcel()
        {
            var result = await _statisticalReportRepository.ExportReportMemberExcelAsync();
            string fileName = $"MemberReport-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(result, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
    }
}
