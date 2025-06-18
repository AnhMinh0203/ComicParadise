using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class AddStoryDto
    {
        public string Title { get; set; }
        public string Author { get; set; }
        public string Type { get; set; }
        public int PublisherID { get; set; }
        public IFormFile CoverImage { get; set; }
        public string Description { get; set; }
        public List<int> CategoryIDs { get; set; }
        public List<PostChapterDto> Chapters { get; set; }
    }

    public class UpdateStoryDto
    {
        public int StoryID { get; set; }
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Type { get; set; }
        public IFormFile? CoverImage { get; set; }
        public string? Description { get; set; }
        public List<int>? CategoryIDs { get; set; }
    }

}
