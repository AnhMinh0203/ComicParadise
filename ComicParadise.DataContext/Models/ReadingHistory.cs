using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class ReadingHistory
    {
        public int HistoryID { get; set; }
        public int UserID { get; set; }
        public int? StoryID { get; set; }
        public DateTime LastReadAt { get; set; }
    }
}
