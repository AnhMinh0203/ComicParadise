using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ReadingHistoryDTO
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public string CoverImage { get; set; }
        public int Views {  get; set; } 
        public DateTime LastReadAt { get; set; }
    }
}
