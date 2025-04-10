using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Favorite
    {
        public int FavoriteID { get; set; }
        public int UserID { get; set; }
        public int StoryID { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
