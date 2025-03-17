using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class ChartReportDto
    {
        public string Label { get; set; } // "Tháng 1", "Q2", "2023"
        public int Count { get; set; } // Số lượng truyện
    }
}
