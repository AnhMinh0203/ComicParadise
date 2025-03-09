using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ChapterContentDto
    {
        public string ChapterType { get; set; }
        public string? PdfUrl { get; set; } 
        public List<string>? ImageUrls { get; set; }
    }
}
