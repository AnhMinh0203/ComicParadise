using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class FooterManagementRepository : IFooterContentRepository
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public FooterManagementRepository(AppDbContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
        }

        #region Get footer contents
        public async Task<List<FooterContent>> GetFooterContentsAsync()
        {
            return await _context.FooterContents.ToListAsync();
        }
        #endregion

        #region Update footer status
        public async Task<string> UpdateStatusFooterAsync(int footerContetnID)
        {
            try
            {
                var exsistFooter = await _context.FooterContents.Where(f => f.FooterContentID == footerContetnID).FirstOrDefaultAsync();
                if (exsistFooter != null)
                {
                    exsistFooter.IsActive = !exsistFooter.IsActive;
                    await _context.SaveChangesAsync();
                    return "Cập nhật trạng thái thành công";
                }
                return "Nội dung chân trang không tồn tại";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }
        #endregion

        #region Add footer content
        public async Task<string> AddFooterContentAsync(FooterContent newFooterContent)
        {
            try
            {
                await _context.FooterContents.AddAsync(newFooterContent);
                await _context.SaveChangesAsync();

                return "Thêm nội dung chân trang thành công";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }
        #endregion

        #region Update footer content
        public async Task<string> UpdateFooterContentAsync(FooterContent updatedFooterContent)
        {
            try
            {
                var existingFooter = await _context.FooterContents
                    .Where(f => f.FooterContentID == updatedFooterContent.FooterContentID)
                    .FirstOrDefaultAsync();

                if (existingFooter == null)
                {
                    return "Nội dung chân trang không tồn tại";
                }
                existingFooter.Title = updatedFooterContent.Title;
                existingFooter.IconName = updatedFooterContent.IconName;
                existingFooter.Link = updatedFooterContent.Link;
                existingFooter.IsActive = updatedFooterContent.IsActive;

                await _context.SaveChangesAsync();
                return "Cập nhật nội dung chân trang thành công";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }

        #endregion

        #region Delete footer content
        public async Task<string> DeleteFooterContentAsync (int footerContentID)
        {
            try
            {
                var existingFooter = await _context.FooterContents
                    .Where(f => f.FooterContentID == footerContentID)
                    .FirstOrDefaultAsync();

                if (existingFooter == null)
                {
                    return "Nội dung chân trang không tồn tại";
                }
                
                _context.FooterContents.Remove(existingFooter);
                await _context.SaveChangesAsync();
                return "Xóa nội dung chân trang thành công";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }
        #endregion

    }
}
