using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Rating
    {
        public int RatingID { get; set; }        
        public int UserID { get; set; }      
        public int StoryID { get; set; }       
        public int RatingValue { get; set; }     
        public DateTime RatingDate { get; set; } = DateTime.Now;
    }
}
