using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class StoryCategoriesMapping
    {
        public int StoryID { get; set; }
        public int CategoryID { get; set; }

/*        public Story Story { get; set; }

        public Category Category { get; set; }*/

    }

}
