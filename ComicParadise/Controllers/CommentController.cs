using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        public CommentController(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        [HttpPost("Post-comment")]
        public async Task<ActionResult> PostComment(Comment comment)
        {
            var result = await _commentRepository.PostCommentAsync(comment);
            if(result == null)
            {
                return Ok(new BaseResponse<Comment>(false, null));

            }
            return Ok(new BaseResponse<Comment>(true, result));
        }
    }
}
