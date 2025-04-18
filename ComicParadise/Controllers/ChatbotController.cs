using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
using ComicParadise.Repository.Common;
using ComicParadise.Repository.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotRepository _chatbotRepository;
        public ChatbotController(IChatbotRepository chatbotRepository)
        {
            _chatbotRepository = chatbotRepository;
        }

        [HttpPost("Process-user-question")]
        public async Task<ActionResult> ProcessUserQuestionAsync(ChatRequest request)
        {
            var result = await _chatbotRepository.ProcessUserQuestionAsync(request.Prompt);
            return Ok(new BaseResponse<dynamic>(true, result));
        }
    }
}
