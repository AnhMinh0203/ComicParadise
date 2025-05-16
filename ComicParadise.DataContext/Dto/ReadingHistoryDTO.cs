using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ReadingHistoryDto
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public string CoverImage { get; set; }
        public int Views {  get; set; } 
        public DateTime LastReadAt { get; set; }
        public List<Category> Categories { get; set; }
    }
}
