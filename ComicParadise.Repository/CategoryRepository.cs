using AutoMapper;
using ComicParadise.DataContext.Database;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.Repository.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        public CategoryRepository(IConfiguration config, AppDbContext context, IMapper mapper)
        {
            _config = config;
            _context = context;
            _mapper = mapper;
        }

        #region Get all categories
        public async Task<List<Category>> GetAllCategoriesAsync()
        {
            List<Category> categories = await _context.Categories
                .Select(c => new Category
                {
                    CategoryID = c.CategoryID,
                    CategoryName = c.CategoryName,
                    Description = c.Description,
                }).ToListAsync();

            return categories;
        }
        #endregion

        #region Search category
        public async Task<List<Category>?> SearchCategoryAsync(string? categoryName)
        {
            if (string.IsNullOrEmpty(categoryName))
            {
                return await _context.Categories.ToListAsync();
            }
            return await _context.Categories.Where(c => c.CategoryName.Contains(categoryName)).ToListAsync();
        }
        #endregion

        #region Add cateegory
        public async Task<string> AddCategoryAsync(CategoryDto categoryDto)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryName == categoryDto.CategoryName);
            if (category != null)
            {
                return "Tên chuyên mục đã tồn tại";
            }
            var newCategory = _mapper.Map<Category>(categoryDto); // Ánh xạ Dto sang Entity
            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return "Thêm chuyên mục thành công";
        }
        #endregion

        #region Update category
        public async Task<string> UpdateCategoryAsync(Category categoryParam)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryID == categoryParam.CategoryID);
            if (category == null)
            {
                return "Chuyên mục không tồn tại";
            }
            category.CategoryName = categoryParam.CategoryName;
            category.Description = categoryParam.Description;

            await _context.SaveChangesAsync();

            return "Cập nhật thông tin chuyên mục thành công";
        }
        #endregion

        #region Delete category
        public async Task<string> DeleteCategoryAsync(int categoryID)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryID == categoryID);

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return "Xóa chuyên mục thành công";
        }
        #endregion

        #region Get categories for user side
        public async Task<IEnumerable<dynamic>> GetCategoriesForUserAsync()
        {
            /* var result = await (from c in _context.Categories
                                 join cd in _context.CategoryDetails on c.CategoryID equals cd.CategoryID
                                 group cd by new { c.CategoryID, c.CategoryName } into cg
                                 select new
                                 {
                                     label = cg.Key.CategoryName,
                                     items = cg.Select(sub => new
                                     {
                                         label = sub.SubCategoryName
                                     })
                                 }).AsNoTracking().ToListAsync();
             return result;*/

            var result = await _context.Categories
                               .Select(c => new
                               {
                                   CategoryID = c.CategoryID,
                                   CategoryName = c.CategoryName
                               })
                               .AsNoTracking()
                               .ToListAsync();

            return result;
        }
        #endregion
    }
}
