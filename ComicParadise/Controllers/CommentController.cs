using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
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

        [HttpPost("Update-reaction")]
        public async Task<ActionResult> UpdateReaction(Reaction reaction)
        {
            var result = await _commentRepository.UpdateReaction(reaction);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpPost("Update-status-comment")]
        public async Task<ActionResult> UpdateStatusComment (UpdateStatusRequest updateStatusRequest)
        {
            var result = await _commentRepository.UpdateStatusCommentAsync(updateStatusRequest);
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpDelete("Delete-comment")]
        public async Task<ActionResult> DeleteComment (int commentID)
        {
            var result = await _commentRepository.DeleteCommentAsync(commentID);
            return Ok(new BaseResponse<string>(true,result));
        }

        [HttpGet("Get-comments-by-storyID")]
        public async Task<ActionResult> GetChaptersByStoryID(int storyID)
        {
            var result = await _commentRepository.GetCommentsByStoryIDAsync(storyID);
            return Ok(new BaseResponse<List<CommentDto>>(true, result));
        }
    }
}
