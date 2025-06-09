using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FooterContentController : ControllerBase
    {
        private readonly IFooterContentRepository _footerContentRepository;
        public FooterContentController(IFooterContentRepository footerContentRepository)
        {
            _footerContentRepository = footerContentRepository;
        }

        [HttpGet("Get-footer-contents")]
        public async Task<ActionResult> GetFooterContents()
        {
            var result = await _footerContentRepository.GetFooterContentsAsync();
            return Ok(new BaseResponse<List<FooterContent>>(true, result));
        }

        [HttpPost("Update-status-footer")]
        public async Task<ActionResult> UpdateStatusFooter(int footerContentID)
        {
            var result = await _footerContentRepository.UpdateStatusFooterAsync(footerContentID);
            return Ok(new BaseResponse<string>(true, result));
        }


        [HttpPost("Add-footer-content")]
        public async Task<ActionResult> AddFooterContent(FooterContent footerContent)
        {
            var result = await _footerContentRepository.AddFooterContentAsync(footerContent);
            return Ok(new BaseResponse<string>(true, result));
        }


        [HttpPost("Update-footer-content")]
        public async Task<ActionResult> UpdateFooterContent(FooterContent footerContent)
        {
            var result = await _footerContentRepository.UpdateFooterContentAsync(footerContent);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpDelete("Delete-footer-content")]
        public async Task<ActionResult> DeleteFooterContent(int footerContentID)
        {
            var result = await _footerContentRepository.DeleteFooterContentAsync(footerContentID);
            return Ok(new BaseResponse<string>(true, result));
        }
    }
}
