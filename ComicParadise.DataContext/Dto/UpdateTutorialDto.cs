using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class UpdateTutorialDto
    {
        public int TutorialID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
    }
}
