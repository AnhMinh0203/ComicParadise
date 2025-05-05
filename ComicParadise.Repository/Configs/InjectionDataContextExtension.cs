using Amazon.S3;
using ComicParadise.DataContext.Mapping;
using ComicParadise.Repository.Common;
using ComicParadise.Repository.Interface;
using ComicParadise.Repository.Services;
using Microsoft.Extensions.Configuration;
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
            services.AddScoped<IStatisticalReportRepository, StatisticalReportRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IReportRepository, ReportRepository>();
            services.AddScoped<IChatbotRepository, ChatbotRepository>();
            services.AddScoped<ITutorialRepository, TutorialManagementRepository>();
            services.AddScoped<IFooterContentRepository, FooterManagementRepository>();
            services.AddScoped<IBannerManagementRepository, BannerManagementRepository>();
            services.AddScoped<IEmailService, EmailService>();

            // Register AutoMapper
            services.AddAutoMapper(typeof(CategoryProfile));
            services.AddAutoMapper(typeof(ReportProfile));

            // SignalR config
            services.AddSignalR();


        }
    }
}
