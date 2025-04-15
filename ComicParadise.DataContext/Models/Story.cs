using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Story
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public int PublisherID { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public int Views { get; set; }
        public int Likes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Description { get; set; }
        public string CoverImage { get; set; }
        public bool IsComplete { get; set; }
    }

}
