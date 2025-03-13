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


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Định nghĩa khóa chính tổng hợp (Composite Primary Key) cho bảng StoryCategoriesMapping
            modelBuilder.Entity<StoryCategoriesMapping>()
                .HasKey(sc => new { sc.StoryID, sc.CategoryID });

            modelBuilder.Entity<ReadingHistory>()
               .HasKey(h => new { h.HistoryID });

            base.OnModelCreating(modelBuilder);
        }


    }
}
