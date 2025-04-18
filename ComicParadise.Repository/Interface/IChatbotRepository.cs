using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Interface
{
    public interface IChatbotRepository
    {
        Task<string> ProcessUserQuestionAsync(string prompt);
    }
}
