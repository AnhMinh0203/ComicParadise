using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ComicParadise.DataContext.Dto
{

    public class StoryInfor
    {
        public int StoryID { get; set; }
        public string Title { get; set; }
        public string CoverImage { get; set; }
        public string Status { get; set; }
        public string? PublisherName { get; set; }
        public int TotalChapter { get; set; }
    }
}
