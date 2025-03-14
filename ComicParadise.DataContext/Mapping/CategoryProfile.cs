using AutoMapper;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;

namespace ComicParadise.DataContext.Mapping
{
    public class CategoryProfile: Profile
    {
        public CategoryProfile()
        {
            CreateMap<CategoryDto, Category>();  // Ánh xạ từ DTO sang Entity
        }
    }
}
