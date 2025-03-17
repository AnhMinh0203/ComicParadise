using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ReportStoryDto
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public int TotalChapter { get; set; }
        public int Views {  get; set; }
        public int Likes { get; set; }
        public DateTime CreatedAt {  get; set; }    

    }
}
