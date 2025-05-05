using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface ITutorialRepository
    {
        Task<string> AddTutorialAsync(AddTutorialDto tutorialDto);
        Task<List<string>> GetTutorialTitlesAsync();
        Task<string?> GetContentByTitleAsyn(string title);
        Task<List<Tutorial>> GetAllTutorialsAysnc();
        Task<string> UpdateTutorialAsync(UpdateTutorialDto updateTutorialDto);
        Task<string> DeleteTutorialAsync(int tutorialID);
    }
}
