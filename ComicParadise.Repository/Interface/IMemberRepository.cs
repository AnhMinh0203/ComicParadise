using ComicParadise.DataContext.Dto;
using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository.Common
{
    public interface IMemberRepository
    {
        Task<List<User>> GetAllMembersAsync();
        Task<string> AddMemberAsync(AddMemberDto addMemberDto);
        Task<byte[]> ExportExcelAsync();
        Task<string> UpdateMemberAsync(UpdateMemberDto user);
        Task<IQueryable<ReadingHistoryDto>> GetReadingHistoryAsync(int userID);
        Task<IQueryable<ReadingHistoryDto>> GetReadingHistoryByRangeAsync(int userID, string range);
        Task<string> DeleteMemberAsync(int userID);
        Task<User?> GetMemberById(int userID);

    }
}
