using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class PostCommentDto: Comment
    {
        public string? Username { get; set; }
    }
}
