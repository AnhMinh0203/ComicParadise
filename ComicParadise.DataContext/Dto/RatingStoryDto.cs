using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class RatingStoryDto
    {
        public int UserID { get; set; }
        public int StoryID { get; set; }
        public int RatingValue { get; set; }
    }
}
