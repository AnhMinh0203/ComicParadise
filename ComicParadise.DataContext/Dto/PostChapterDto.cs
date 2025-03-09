using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class PostChapterDto
    {
        public int StoryID { get; set; }
/*        public string StoryType { get; set; }   */
        public int ChapterNumber { get; set; }
        public string Title { get; set; }
        public string ChapterType { get; set; }
        public IFormFile? PdfFile { get; set; } // Dùng khi ChapterType = "PDF"
        public List<IFormFile>? ImageFiles { get; set; } // Dùng khi ChapterType = "Image"

    }
}
