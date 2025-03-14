using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Category
    {
        public int? CategoryID { get; set; }
        public string CategoryName { get; set; }
        public string? Description { get; set; }
    }
}
