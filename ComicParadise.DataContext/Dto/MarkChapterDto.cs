using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class MarkChapterDto
    {
        public int StoryID { get; set; }
        public int ChapterNumber { get; set; }
        public int UserID { get; set; }

    };
}