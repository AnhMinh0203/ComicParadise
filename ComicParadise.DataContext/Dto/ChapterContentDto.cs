using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ChapterContentDto
    {
        public string StoryType { get; set; }
        public string? Content { get; set; }
        public List<string>? ImageUrls { get; set; }
    }
}
