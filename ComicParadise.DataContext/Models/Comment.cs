using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Comment
    {

        public int CommentID { get; set; }
        public int StoryID { get; set; }
        public int UserID { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } 

        public string Status { get; set; }
        public int? Reply { get; set; }
        public int Likes { get; set; }
        public int DisLikes { get; set; }

    }

}
