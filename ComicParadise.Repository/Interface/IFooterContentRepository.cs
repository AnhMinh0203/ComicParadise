using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface IFooterContentRepository
    {
        Task<List<FooterContent>> GetFooterContentsAsync();
        Task<string> UpdateStatusFooterAsync(int footerContetnID);
        Task<string> AddFooterContentAsync(FooterContent newFooterContent);
        Task<string> UpdateFooterContentAsync(FooterContent updatedFooterContent);
        Task<string> DeleteFooterContentAsync(int footerContentID);
    }
}
