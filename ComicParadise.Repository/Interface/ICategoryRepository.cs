using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllCategoriesAsync();
        Task<List<Category>?> SearchCategoryAsync(string? categoryName);
        Task<string> AddCategoryAsync(CategoryDto categoryDto);
        Task<string> UpdateCategoryAsync(Category categoryParam);
        Task<string> DeleteCategoryAsync(int categoryID);
        Task<IEnumerable<dynamic>> GetCategoriesForUserAsync();
    }
}
