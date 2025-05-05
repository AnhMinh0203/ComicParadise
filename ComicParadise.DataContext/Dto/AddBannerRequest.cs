using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class AddBannerRequest
    {
        public IFormFile BannerImg { get; set; }
        public string? Link { get; set; }
        public int OrderIndex { get; set; }
    }
}
