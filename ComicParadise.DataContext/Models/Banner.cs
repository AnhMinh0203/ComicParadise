using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Banner
    {
        public int BannerID { get; set; }
        public string ImageUrl { get; set; }
        public string? Link { get; set; }
        public int OrderIndex { get; set; }
        public bool IsActive { get; set; }
    }

}
