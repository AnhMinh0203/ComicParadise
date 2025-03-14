using ComicParadise.DataContext.Mapping;
using ComicParadise.Repository.Common;
using Microsoft.Extensions.DependencyInjection;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Configs
{
    public static class InjectionDataContextExtension
    {
        public static void AddDataContextServices(this IServiceCollection services)
        {
            // Register Service
            services.AddScoped<IAuthenRepository, AuthenRepository>();
            services.AddScoped<IMemberRepository, MemberRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IStoryRepository, StoryRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<IChapterRepository, ChapterRepository>();

            // Register AutoMapper
            services.AddAutoMapper(typeof(CategoryProfile));
        }
    }
}
