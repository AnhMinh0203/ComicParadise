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
        /*public async Task<List<CommentDto>> GetCommentsByStoryIDAsync(int storyID)
        {
            var comments = await (from cm in _context.Comments
                                  join u2 in _context.Users on cm.UserID equals u2.UserID into users
                                  from u2 in users.DefaultIfEmpty()
                                  where cm.StoryID == storyID && cm.Reply == null
                                  select new CommentDto
                                  {
                                      CommentID = cm.CommentID,
                                      StoryID = cm.StoryID,
                                      UserID = cm.UserID,
                                      Username = u2 != null ? u2.Username : "Người dùng ẩn danh",
                                      Content = cm.Content,
                                      CreatedAt = cm.CreatedAt,
                                      CompletionStatus = cm.CompletionStatus,
                                      Reply = cm.Reply,
                                      Likes = cm.Likes,
                                      DisLikes = cm.DisLikes,
                                      ChildComments = (from cc in _context.Comments
                                                       where cc.Reply == cm.CommentID
                                                       select new CommentDto
                                                       {
                                                           CommentID = cc.CommentID,
                                                           StoryID = cc.StoryID,
                                                           UserID = cc.UserID,
                                                           Username = u2 != null ? u2.Username : "Người dùng ẩn danh",
                                                           Content = cc.Content,
                                                           CreatedAt = cc.CreatedAt,
                                                           CompletionStatus = cc.CompletionStatus,
                                                           Reply = cc.Reply,
                                                           Likes = cc.Likes,
                                                           DisLikes = cc.DisLikes,
                                                           Reactions = (from r in _context.Reactions
                                                                        join u in _context.Users on r.UserID equals u.UserID
                                                                        where r.CommentID == cc.CommentID
                                                                        select r).ToList()
                                                       }).ToList(),
                                      Reactions = (from r in _context.Reactions
                                                   join u in _context.Users on r.UserID equals u.UserID
                                                   where r.CommentID == cm.CommentID
                                                   select r).ToList()
                                  }).ToListAsync();
            return comments;
        }*/

        public async Task<List<CommentDto>> GetCommentsByStoryIDAsync(int storyID)
        {
            // Lấy tất cả comment liên quan đến storyID một lần
            var allComments = await _context.Comments
                .Where(c => c.StoryID == storyID)
                .ToListAsync();

            // Lấy tất cả user liên quan đến các comment
            var userIds = allComments.Select(c => c.UserID).Distinct().ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserID))
                .ToDictionaryAsync(u => u.UserID, u => u.Username);

            // Lấy tất cả reaction liên quan đến các comment
            var commentIds = allComments.Select(c => c.CommentID).ToList();
            var reactions = await _context.Reactions
                .Where(r => commentIds.Contains(r.CommentID))
                .Join(_context.Users,
                    r => r.UserID,
                    u => u.UserID,
                    (r, u) => r)
                .ToListAsync();

            // Xử lý trong bộ nhớ: phân loại comment cha và con
            var commentDict = allComments.ToDictionary(c => c.CommentID);
            var parentComments = allComments
                .Where(c => c.Reply == null)
                .Select(c => new CommentDto
                {
                    CommentID = c.CommentID,
                    StoryID = c.StoryID,
                    UserID = c.UserID,
                    Username = users.ContainsKey(c.UserID) ? users[c.UserID] : "Người dùng ẩn danh",
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    Status = c.Status,
                    Reply = c.Reply,
                    Likes = c.Likes,
                    DisLikes = c.DisLikes,
                    ChildComments = allComments
                        .Where(cc => cc.Reply == c.CommentID)
                        .Select(cc => new CommentDto
                        {
                            CommentID = cc.CommentID,
                            StoryID = cc.StoryID,
                            UserID = cc.UserID,
                            Username = users.ContainsKey(cc.UserID) ? users[cc.UserID] : "Người dùng ẩn danh",
                            Content = cc.Content,
                            CreatedAt = cc.CreatedAt,
                            Status = cc.Status,
                            Reply = cc.Reply,
                            Likes = cc.Likes,
                            DisLikes = cc.DisLikes,
                            Reactions = reactions.Where(r => r.CommentID == cc.CommentID).ToList()
                        }).ToList(),
                    Reactions = reactions.Where(r => r.CommentID == c.CommentID).ToList()
                }).ToList();

            return parentComments;
        }
        #endregion

    }
}
