using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ChapterPageRequest
    {
        public int storyID { get; set; }
        public int chapterNumber { get; set; }
        public int? chapterPage { get; set; }
        public IFormFile newPage { get; set; }
    }
}
