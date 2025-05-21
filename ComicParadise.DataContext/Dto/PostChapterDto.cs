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
        public int ChapterNumber { get; set; }
        public string Title { get; set; }
        public string StoryType { get; set; }
        public string? Content { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
        public int CreatedBy { get; set; }
    }
}
