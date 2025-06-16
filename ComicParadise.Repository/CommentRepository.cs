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
        private readonly INotificationRepository _notificationRepository;
        public CommentRepository(
            AppDbContext context,
            IConfiguration config,
            INotificationRepository notificationRepository)
        {
            _config = config;
            _context = context;
            _notificationRepository = notificationRepository;
        }

        #region Post comment
        public async Task<Comment?> PostCommentAsync(Comment comment)
        {
            try
            {
                var user = await _context.Users.FindAsync(comment.UserID);
                var story = await _context.Stories.FindAsync(comment.StoryID);
                /*                if (user == null)
                                {
                                    return null;
                                }*/
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
            catch (Exception ex)
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
        public async Task<string> DeleteCommentAsync(int commentID)
        {
            var comment = await _context.Comments.FindAsync(commentID) ?? throw new Exception("Bình luận không tồn tại");
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return "Xóa bình luận thành công";
        }

        #endregion

        #region Get comment by storyID
        public async Task<List<CommentDto>> GetCommentsByStoryIDAsync(int storyID, int pageIndex, int pageSize )
        {
            var parentCommentsQuery = _context.Comments
                .Where(c => c.StoryID == storyID && c.Reply == null)
                .OrderByDescending(c => c.CreatedAt);

            var parentComments = await parentCommentsQuery
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var parentCommentIds = parentComments.Select(c => c.CommentID).ToList();

            var childComments = await _context.Comments
                .Where(c => c.Reply != null && parentCommentIds.Contains(c.Reply.Value))
                .ToListAsync();

            var userIds = parentComments.Select(c => c.UserID)
                            .Concat(childComments.Select(c => c.UserID))
                            .Distinct()
                            .ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserID))
                .ToDictionaryAsync(u => u.UserID, u => u.Username);

            var allCommentIds = parentCommentIds.Concat(childComments.Select(c => c.CommentID)).ToList();
            var reactions = await _context.Reactions
                .Where(r => allCommentIds.Contains(r.CommentID))
                .ToListAsync();

            var result = parentComments.Select(parent => new CommentDto
            {
                CommentID = parent.CommentID,
                StoryID = parent.StoryID,
                UserID = parent.UserID,
                Username = users.GetValueOrDefault(parent.UserID, "Người dùng ẩn danh"),
                Content = parent.Content,
                CreatedAt = parent.CreatedAt,
                Status = parent.Status,
                Reply = parent.Reply,
                Likes = parent.Likes,
                DisLikes = parent.DisLikes,
                Reactions = reactions.Where(r => r.CommentID == parent.CommentID).ToList(),
                ChildComments = childComments
                    .Where(c => c.Reply == parent.CommentID)
                    .Select(cc => new CommentDto
                    {
                        CommentID = cc.CommentID,
                        StoryID = cc.StoryID,
                        UserID = cc.UserID,
                        Username = users.GetValueOrDefault(cc.UserID, "Người dùng ẩn danh"),
                        Content = cc.Content,
                        CreatedAt = cc.CreatedAt,
                        Status = cc.Status,
                        Reply = cc.Reply,
                        Likes = cc.Likes,
                        DisLikes = cc.DisLikes,
                        Reactions = reactions.Where(r => r.CommentID == cc.CommentID).ToList()
                    }).ToList()
            }).ToList();

            return result;
        }

        #endregion

    }
}
