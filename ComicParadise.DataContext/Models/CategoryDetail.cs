using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class CategoryDetail
    {
        public int DetailID { get; set; }
        public int CategoryID { get; set; }
        public string SubCategoryName { get; set; }
        public string SubDescription { get; set; }
    }
}
