using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;
        public ReportController(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        [HttpPost("Create-report")]
        public async Task<ActionResult> CreateReport (ReportDto reportDto)
        {
            var result = await _reportRepository.CreateReportAsync(reportDto);
            return Ok(new BaseResponse<string>(true, result));
        }

    }
}
