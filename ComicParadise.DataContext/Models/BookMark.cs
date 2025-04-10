using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class BookMark
    {
        public int BookMarkID { get; set; }
        public int StoryID { get; set; }
        public int ChapterNumber { get; set; }
        public int UserID { get; set; }
        public DateTime BookmarkedAt { get; set; } = DateTime.Now;

    }
}
