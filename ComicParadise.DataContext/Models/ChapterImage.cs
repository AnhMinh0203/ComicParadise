using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class ChapterImage
    {
        public int Id { get; set; }
        public int ChapterId { get; set; }
        public string ImagePath { get; set; } 
        public int Order { get; set; } 
    }
}
