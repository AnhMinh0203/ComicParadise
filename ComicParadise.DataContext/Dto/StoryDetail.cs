using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class StoryDetail
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public string CoverImage { get; set; }
        public string Author { get; set; }  
        public string Type { get; set; }    
        public string Description { get; set; }
        public int Views {  get; set; }
        public int Likes { get; set; }
        public List<Category> Categories { get; set; }
        public List<CommentDto> comments { get; set; }
    }
}
