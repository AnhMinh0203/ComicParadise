using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TutorialController : ControllerBase
    {
        private readonly ITutorialRepository _tutorialRepository;

        public TutorialController(ITutorialRepository tutorialRepository)
        {
            _tutorialRepository = tutorialRepository;
        }

        [HttpPost("Add-tutorial")]
        public async Task<ActionResult> AddTutorial(AddTutorialDto addTutorialDto)
        {
            var result = await _tutorialRepository.AddTutorialAsync(addTutorialDto);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Get-tutorial-titles")]
        public async Task<ActionResult> GetTutorialTitles()
        {
            var result = await _tutorialRepository.GetTutorialTitlesAsync();
            return Ok(new BaseResponse<List<string>>(true, result));
        }

        [HttpPost("Get-content-by-title")]
        public async Task<ActionResult> GetContentByTitle(string title)
        {
            var result = await _tutorialRepository.GetContentByTitleAsyn(title);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpGet("Get-all-tutorials")]
        public async Task<ActionResult> GetAllTutorials()
        {
            var result = await _tutorialRepository.GetAllTutorialsAysnc();
            return Ok(new BaseResponse<List<Tutorial>>(true, result));
        }

        [HttpPost("Update-tutorial")]
        public async Task<ActionResult> UpdateTutorial(UpdateTutorialDto updateTutorialDto)
        {
            var result = await _tutorialRepository.UpdateTutorialAsync(updateTutorialDto);

            if (result.Contains("Lỗi"))
            {
                return Ok(new BaseResponse<string>(false, result));
            }
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpDelete("Delete-tutorial")]
        public async Task<ActionResult> DeleteTutorial(int tutorialID)
        {
            var result = await _tutorialRepository.DeleteTutorialAsync(tutorialID);

            if (result.Contains("Lỗi"))
            {
                return Ok(new BaseResponse<string>(false, result));
            }
            return Ok(new BaseResponse<string>(true, result));
        }
    }
}
