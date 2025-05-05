using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class FooterContent
    {
        public int FooterContentID { get; set; }
        public string? Title { get; set; }
        public string? IconName { get; set; }
        public string? Link { get; set; }
        public bool IsActive { get; set; }
    }

}
