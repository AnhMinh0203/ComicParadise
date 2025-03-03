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
    }
}
