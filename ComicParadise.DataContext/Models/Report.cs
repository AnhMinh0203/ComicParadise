using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Models
{
    public class Report
    {
        public int ReportID { get; set; }
        public string TargetType { get; set; }     
        public int TargetID { get; set; }
        public int CreatedBy { get; set; }       
        public string Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Pending";
    }
}
