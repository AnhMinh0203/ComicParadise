using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Reaction
    {
        public int ReactionID { get; set; }
        public int CommentID { get; set; }
        public int UserID { get; set; }
        public bool IsLike { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
