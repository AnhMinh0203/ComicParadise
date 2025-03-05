using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class CommentDto : Comment
    {
        public string? Username { get; set; }
        public List<CommentDto> ChildComments { get; set; } = new List<CommentDto>();
    }
}
