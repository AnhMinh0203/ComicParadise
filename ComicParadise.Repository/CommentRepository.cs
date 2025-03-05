using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class CommentRepository: ICommentRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public CommentRepository(AppDbContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
        }

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
    }
}
