using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        [HttpGet("Get-all-categories")]
        public async Task<ActionResult> GetAllCategories()
        {
            var result = await _categoryRepository.GetAllCategoriesAsync();
            return Ok(new BaseResponse<List<Category>> (true,result));
        }

        [HttpGet("Search-categories")]
        public async Task<ActionResult> SearchCategories (string? categoryName)
        {
            var result = await _categoryRepository.SearchCategoryAsync(categoryName);
            return Ok(new BaseResponse<List<Category>> (true,result)); 
        }

        [HttpPost("Add-category")]
        public async Task<ActionResult> AddCategory(CategoryDto category)
        {
            var result = await _categoryRepository.AddCategoryAsync(category);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpPost("Update-category")]
        public async Task<ActionResult> UpdateCategory(Category categoryParam)
        {
            var result = await _categoryRepository.UpdateCategoryAsync(categoryParam);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpDelete("Delete-Category")]
        public async Task<ActionResult> DeleteCategory (int categoryID)
        {
            var result = await _categoryRepository.DeleteCategoryAsync(categoryID);
            return Ok(new BaseResponse<string>(true,result));
        }

    }
}
