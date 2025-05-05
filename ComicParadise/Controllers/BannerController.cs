using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannerController : ControllerBase
    {
        private IBannerManagementRepository _bannerManagementRepository;
        public BannerController(IBannerManagementRepository bannerManagementRepository)
        {
            _bannerManagementRepository = bannerManagementRepository;
        }

        [HttpPost("Add-banner")]
        public async Task<ActionResult> AddBanner (AddBannerRequest request)
        {
            var result = await _bannerManagementRepository.AddBannerAsync(request);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Get-banners")]
        public async Task<ActionResult> GetFooterContents()
        {
            var result = await _bannerManagementRepository.GetBannersAsync();
            return Ok(new BaseResponse<List<Banner>>(true, result));
        }
    }
}
