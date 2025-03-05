using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    using System;

    public class Chapter
    {
        public int ChapterID { get; set; }
        public int StoryID { get; set; }
        public int ChapterNumber { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string SourceUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
