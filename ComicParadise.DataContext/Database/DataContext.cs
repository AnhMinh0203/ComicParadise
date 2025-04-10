using ComicParadise.DataContext.Models;
using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Story> Stories { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<StoryCategoriesMapping> StoryCategoriesMapping { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<ChapterImage> ChapterImages { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<ReadingHistory> ReadingHistories { get; set; }
        public DbSet<CategoryDetail> CategoryDetails { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<BookMark> BookMarks { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StoryCategoriesMapping>()
                .HasKey(sc => new { sc.StoryID, sc.CategoryID });

            modelBuilder.Entity<ReadingHistory>()
               .HasKey(h => new { h.HistoryID });

            modelBuilder.Entity<CategoryDetail>()
               .HasKey(dt => new { dt.DetailID });

            modelBuilder.Entity<Report>()
               .HasKey(r => new { r.ReportID });

            modelBuilder.Entity<BookMark>()
              .HasKey(b => new { b.BookMarkID });

            base.OnModelCreating(modelBuilder);
        }


    }
}
