namespace ComicParadise.DataContext.Utils
{
    public class UserAuthen
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Avatar {  get; set; }
        public string? Identifier { get; set; }
        public string? PasswordHash { get; set; }
    }
}
