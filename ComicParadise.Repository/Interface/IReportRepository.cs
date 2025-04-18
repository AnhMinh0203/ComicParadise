using ComicParadise.DataContext.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface IReportRepository
    {
        Task<string> CreateReportAsync(ReportDto reportDto);
        Task<List<dynamic>> GetReportAsync(string reportType);
    }
}
