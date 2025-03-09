using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public CommentRepository(AppDbContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
        }

        #region Post comment
        public async Task<Comment?> PostCommentAsync(Comment comment)
        {
            try
            {
                var user = await _context.Users.FindAsync(comment.UserID);
                var story = await _context.Stories.FindAsync(comment.StoryID);
                if (user == null)
                {
                    return null;
                }
                if (story == null)
                {
                    return null;
                }

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();
                return comment;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }
        #endregion

        #region Update reaction
        public async Task<string> UpdateReaction(Reaction reaction)
        {
            try
            {
                var existingReaction = await _context.Reactions
                                        .FirstOrDefaultAsync(r => r.CommentID == reaction.CommentID && r.UserID == reaction.UserID);
                var comment = await _context.Comments.FindAsync(reaction.CommentID);
                if (existingReaction != null)
                {
                    if (existingReaction.IsLike == reaction.IsLike)
                    {
                        
                        _context.Reactions.Remove(existingReaction); // bấm cùng loại thì xóa ko thì chuyển từ dislike -> like hoặc like -> dislike
                        if (reaction.IsLike)
                            comment.Likes -= 1;
                        else
                            comment.DisLikes -= 1;

                    }
                    else
                    {
                        existingReaction.IsLike = reaction.IsLike;
                        if (reaction.IsLike)
                        {
                            comment.Likes += 1;
                            comment.DisLikes -= 1;
                        }
                        else
                        {
                            comment.Likes -= 1;
                            comment.DisLikes += 1;
                        }
                    }
                }
                else
                {
                    _context.Reactions.Add(reaction);
                    if (reaction.IsLike)
                        comment.Likes += 1;
                    else
                        comment.DisLikes += 1;
                }

                await _context.SaveChangesAsync();
                return "Cập nhật phản ứng thành công !";
                
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            

        }
        #endregion

        #region Update status comment
        public async Task<string> UpdateStatusCommentAsync(UpdateStatusRequest updateStatusRequest)
        {
            try
            {
                var comment = await _context.Comments.FindAsync(updateStatusRequest.CommentID) ?? throw new Exception("Bình luận không tồn tại");

                if (updateStatusRequest.Status is "Visible" or "Hidden")
                {
                    comment.Status = updateStatusRequest.Status;
                    await _context.SaveChangesAsync();
                    return "Cập nhật trạng thái thành công";
                }
                return "Trạng thái không hợp lệ";
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region Delete comment
        public async Task<string> DeleteCommentAsync (int commentID)
        {
            var comment = await _context.Comments.FindAsync(commentID) ?? throw new Exception("Bình luận không tồn tại");
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return "Xóa bình luận thành công";
        }

        #endregion

        #region Get comment by storyID
        public async Task<List<CommentDto>> GetCommentsByStoryIDAsync(int storyID)
        {
            var comments = await (from cm in _context.Comments
                                  join u2 in _context.Users on cm.UserID equals u2.UserID into users
                                  from u2 in users.DefaultIfEmpty()
                                  where cm.StoryID == storyID
                                  select new CommentDto
                                  {
                                      CommentID = cm.CommentID,
                                      StoryID = cm.StoryID,
                                      UserID = cm.UserID,
                                      Username = u2 != null ? u2.Username : "Người dùng ẩn danh",
                                      Content = cm.Content,
                                      CreatedAt = cm.CreatedAt,
                                      Status = cm.Status,
                                      Reply = cm.Reply,
                                      Likes = cm.Likes,
                                      DisLikes = cm.DisLikes,
                                      ChildComments = new List<CommentDto>(),
                                      Reactions = (from r in _context.Reactions
                                                   join u in _context.Users on r.UserID equals u.UserID
                                                   where r.CommentID == cm.CommentID
                                                   select r).ToList()
                                  }).ToListAsync();
            return comments;
        }
        #endregion
    } 
}
