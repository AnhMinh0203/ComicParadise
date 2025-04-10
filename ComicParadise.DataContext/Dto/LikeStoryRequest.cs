using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class LikeStoryRequest
    {
        public int UserID { get; set; }
        public List<int> StoryIDs { get; set; }
    }
}
