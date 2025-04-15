using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class StoryFilterRequest
    {
        public bool? IsManga { get; set; } 
        public bool? IsNovel { get; set; } 
        public string? CompletionStatus { get; set; }
        public bool? HighestViews { get; set; } 
        public bool? HighestRates { get; set; } 
        public int? MinChapters { get; set; }
        public int? MaxChapters { get; set; }
    }
}
