using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface IBannerManagementRepository
    {
        Task<string> AddBannerAsync(AddBannerRequest addBannerRequest);
        Task<List<Banner>> GetBannersAsync();
    }
}
