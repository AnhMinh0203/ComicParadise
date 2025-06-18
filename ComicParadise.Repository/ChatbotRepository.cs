using ComicParadise.DataContext.Dto;
using ComicParadise.Repository.Common;
using ComicParadise.Repository.Constants;
using ComicParadise.Repository.Interface;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class ChatbotRepository : IChatbotRepository
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IStoryRepository _storyRepository;

        private readonly Dictionary<string, Func<string, Task<string>>> _handlers;
        private readonly Dictionary<string, Func<string, Task<string>>> _storyActionHandlers;

        public ChatbotRepository(
            IConfiguration config,
            HttpClient httpClient,
            ICategoryRepository categoryRepository,
            IStoryRepository storyRepository)
        {
            _config = config;
            _httpClient = httpClient;
            _categoryRepository = categoryRepository;
            _storyRepository = storyRepository;

            // Đăng ký handler cho từng chủ đề
            _handlers = new Dictionary<string, Func<string, Task<string>>>
            {
                { "thể loại", HandleCategoryAsync },
                { "truyện", HandleStoryAsync },
            };

            _storyActionHandlers = new Dictionary<string, Func<string, Task<string>>>
            {
                [StoryActions.Popular] = HandlePopularAsync,
/*                [StoryActions.MostViewed] = HandleMostViewedAsync,*/
                [StoryActions.Search] = HandleSearchAsync,
                [StoryActions.List] = HandleListAsync,
            };
        }

        public async Task<string> ProcessUserQuestionAsync(string userQuestion)
        {
            string topic = await DetectTopicFromQuestionAsync(userQuestion);

            if (_handlers.TryGetValue(topic, out var handler))
            {
                return await handler(userQuestion);
            }

            return "Xin lỗi, trợ lý chỉ hỗ trợ các câu hỏi liên quan đến thể loại truyện, truyện nổi bật, giới thiệu và chính sách website.";
        }

        /* --- Detect topic from question --- */
        private async Task<string> DetectTopicFromQuestionAsync(string question)
        {
            var possibleTopics = string.Join(", ", _handlers.Keys); // ví dụ: "thể loại, giới thiệu, chính sách"

            string prompt = $@"
                            Bạn là một hệ thống phân loại chủ đề câu hỏi cho trợ lý ảo về website truyện.

                            Các chủ đề hỗ trợ gồm: {possibleTopics}

                            Câu hỏi người dùng: ""{question}""

                            → Hãy xác định câu hỏi này thuộc chủ đề nào trong các chủ đề trên. 
                            Chỉ trả về duy nhất một từ khóa là tên chủ đề (không giải thích, không thêm ký tự khác). 
                            Nếu không rõ thì trả về: khác.";

            var topic = await CallGeminiAsync(prompt);

            topic = topic?.ToLower().Trim();

            return _handlers.ContainsKey(topic) ? topic : "khác";
        }

        /* --- Call chatbot --- */
        private async Task<string> CallGeminiAsync(string prompt)
        {
            var apiKey = _config["Gemini:ApiKey"];
            var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

            var content = new
            {
                contents = new[]
                {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            }
            };

            var response = await _httpClient.PostAsJsonAsync(requestUrl, content);

            if (!response.IsSuccessStatusCode)
                return "Xin lỗi, có lỗi khi kết nối Gemini.";

            var result = await response.Content.ReadFromJsonAsync<GeminiResponse>();
            Console.WriteLine(JsonSerializer.Serialize(result));

            return result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text ?? "Không có phản hồi từ Gemini.";
        }


        /* --- Handle topic function (Category)  --- */
        private async Task<string> HandleCategoryAsync(string userQuestion)
        {
            var genres = await _categoryRepository.GetAllCategoriesAsync();

            if (genres == null || !genres.Any())
                return "Hiện chưa có dữ liệu về thể loại truyện.";

            string genreInfo = string.Join("\n", genres.Select(g => $"- {g.CategoryName}: {g.Description}"));

            string prompt = $"""
                            Dưới đây là dữ liệu các thể loại truyện của website:

                            {genreInfo}

                            Người dùng hỏi: "{userQuestion}"

                            Yêu cầu:
                            - Chỉ trả lời dựa vào danh sách trên.
                            - Trình bày rõ ràng: mỗi thể loại phải nằm trên **một dòng riêng**, sử dụng gạch đầu dòng (-).
                            - Không sử dụng các ký tự định dạng như **, *, _, ``, hoặc emoji.
                            - Giữ văn phong thân thiện, súc tích, dễ đọc.

                            ==> Trả lời:
                            """;

            return await CallGeminiAsync(prompt);
        }


        /* --- Handle topic function (Story)  --- */

        private async Task<string> DetectStoryActionAsync(string question)
        {
            var prompt = $"""
                Câu hỏi: "{question}"

                Các hành động:
                - {StoryActions.Count}: người dùng muốn biết số lượng truyện.
                - {StoryActions.Detail}: hỏi chi tiết về truyện cụ thể.
                - {StoryActions.Search}: tìm truyện theo tên.
                - {StoryActions.Popular}: hỏi truyện nổi bật, theo thời gian.
                - {StoryActions.MostViewed}: hỏi truyện có lượt xem cao nhất.
                - {StoryActions.List}: hỏi danh sách truyện tổng quát.
                - {StoryActions.Unknown}: không xác định.

                → Hãy trả về **một từ khóa duy nhất** là tên action phù hợp.
            """;

            var action = (await CallGeminiAsync(prompt)).Trim().ToLower();
            return _storyActionHandlers.ContainsKey(action) ? action : StoryActions.Unknown;
        }

        private async Task<string> HandleStoryAsync(string userQuestion)
        {
            var action = await DetectStoryActionAsync(userQuestion);

            if (_storyActionHandlers.TryGetValue(action, out var handler))
            {
                return await handler(userQuestion);
            }

            return "Xin lỗi, chưa hỗ trợ loại câu hỏi này.";
        }

        private async Task<string> HandlePopularAsync(string userQuestion)
        {
            var topStories = await _storyRepository.GetTopStoriesAsync("week", 1, 10);
            if (topStories == null || !topStories.Items.Any())
                return "Hiện không có truyện nổi bật nào.";

            var result = string.Join("\n", topStories.Items.Select(s => $"- {s.Title}"));
            return $"Các truyện nổi bật hiện nay:\n{result}";
        }

        private async Task<string> HandleSearchAsync(string userQuestion)
        {
            string extractPrompt = $"""
            Câu hỏi: "{userQuestion}"

            Hãy trích xuất từ khóa tên truyện mà người dùng muốn tìm.
            Trả về duy nhất 1 từ khóa hoặc cụm từ.
        """;

            string keyword = (await CallGeminiAsync(extractPrompt)).Trim();
            var stories = await _storyRepository.SearchStoryAsync(keyword);

            if (stories == null || !stories.Any())
                return $"Không tìm thấy truyện nào có liên quan đến \"{keyword}\".";

            var display = stories.Take(5).Select(s =>
                $"- {s.Title} (Tác giả: {s.PublisherName}, Lượt xem: {s.Views}, Chương mới nhất: {s.LastestChapter})");

            return $"Kết quả tìm kiếm cho \"{keyword}\":\n{string.Join("\n", display)}";
        }

        private async Task<string> HandleListAsync(string userQuestion)
        {
            var stories = await _storyRepository.GetStoriesAsync(null, null);
            if (!stories.Any())
                return "Hiện chưa có truyện nào trong hệ thống.";

            var result = stories.Take(10).Select(s => $"- {s.Title}");
            return $"Một vài truyện có trong hệ thống:\n{string.Join("\n", result)}";
        }


        /*private async Task<string> HandleStoryAsync(string userQuestion)
        {
            string classifyPrompt = $"""
                Bạn là một hệ thống phân loại câu hỏi liên quan đến truyện trên website.

                Câu hỏi: "{userQuestion}"

                Các loại hành động hỗ trợ:
                - count: Nếu người dùng muốn biết số lượng truyện.
                - detail: Nếu người dùng muốn biết chi tiết của một truyện cụ thể.
                - search: Nếu người dùng muốn tìm kiếm truyện theo tên.
                - popular: Nếu người dùng hỏi truyện nào nổi bật, phổ biến.
                - list: Nếu người dùng muốn xem danh sách truyện (tổng quan).
                - unknown: Nếu không xác định được.

                Hãy trả về **duy nhất một từ khóa hành động** phù hợp nhất với câu hỏi trên (không giải thích gì thêm).
            """;

            string action = (await CallGeminiAsync(classifyPrompt)).Trim().ToLower();

            switch (action)
            {
                *//*                case "count":
                                    int count = await _storyRepository.CountStoryAsync();
                                    return $"Hiện tại website có tổng cộng {count} truyện.";*//*

                case "popular":
                    var topStories = await _storyRepository.GetTopStoriesAsync("week", 1, 15);
                    string topList = string.Join("\n", topStories.Items.Select(s => $"- {s.Title}"));
                    return $"Các truyện nổi bật hiện nay:\n{topList}";

                case "search":
                    // Bước 1: Trích xuất từ khóa liên quan đến tên truyện
                    string extractPrompt = $"""
                        Câu hỏi: "{userQuestion}"

                        Hãy trích xuất từ khóa chính liên quan đến tên truyện mà người dùng đang tìm kiếm.
                        Chỉ trả về 1 từ khóa (hoặc cụm từ ngắn), không giải thích thêm.
                    """;

                    string keyword = (await CallGeminiAsync(extractPrompt)).Trim();

                    var resultList = await _storyRepository.SearchStoryAsync(keyword);

                    if (resultList == null || !resultList.Any())
                        return $"Không tìm thấy truyện nào có liên quan đến \"{keyword}\".";

                    // Giới hạn kết quả trả về (nếu có quá nhiều)
                    var displayList = resultList.Take(5).Select(story =>
                        $"- {story.Title} (Tác giả: {story.PublisherName}, Lượt xem: {story.Views}, Chương mới nhất: {story.LastestChapter})");

                    return $"Đây là những truyện có liên quan đến từ khóa \"{keyword}\":\n{string.Join("\n", displayList)}";


                case "list":
                default:
                    var stories = await _storyRepository.GetStoriesAsync(null, null);
                    var shortList = stories.Take(10).Select(s => $"- {s.Title}").ToList();
                    return $"Danh sách một vài truyện trên website:\n{string.Join("\n", shortList)}";
            }
        }*/


    }
}
