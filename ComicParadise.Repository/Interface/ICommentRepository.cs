using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface ICommentRepository
    {
        Task<Comment?> PostCommentAsync(Comment comment);
        Task<string> UpdateReaction(Reaction reaction);
        Task<string> UpdateStatusCommentAsync(UpdateStatusRequest updateStatusRequest);
        Task<string> DeleteCommentAsync(int commentID);
        Task<List<CommentDto>> GetCommentsByStoryIDAsync(int storyID);
    }
}
