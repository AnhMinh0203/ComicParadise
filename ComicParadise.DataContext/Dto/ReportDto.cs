using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ReportDto
    {
        public int CreatedBy { get; set; }           
        public string TargetType { get; set; }    
        public int TargetID { get; set; }        
        public string Reason { get; set; }
    }
}
