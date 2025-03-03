using ComicParadise.DataContext.Database;
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
        public CategoryRepository(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
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
    }
}
