using AutoMapper;
using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;

namespace ComicParadise.DataContext.Mapping
{
    public class ReportProfile: Profile
    {
        public ReportProfile()
        {
            CreateMap<ReportStoryDto, Story>();  // Ánh xạ từ DTO sang Entity
        }
    }
}
