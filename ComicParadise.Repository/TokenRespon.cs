using ComicParadise.DataContext.Utils;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ComicParadise.DataContext.Utils;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class TokenRespon
    {
        private readonly IConfiguration _config;
        public TokenRespon(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateJwtToken(UserAuthen account, int idUser)
        {
            // tạo token có hiệu lực trong 1 ngày
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]{
                   // Thêm thông tin userId vào token
                    new Claim("userID", idUser.ToString()),
                    new Claim("userName", account.FullName),
                    new Claim("identifier", account.Identifier)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) // Ký token bằng HMAC SHA256
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);  // Tạo token
            return tokenHandler.WriteToken(token); // Trả về token dưới dạng chuỗi
        }


        public Guid? ValidateJwtToken(string? token)
        {
            if (token == null) return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);  // Lấy key để xác thực token.

            try
            {
                // Xác thực token bằng cách sử dụng TokenValidationParameters.
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,  // Kiểm tra xem token có được ký bằng key hợp lệ không.
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                // Lấy các giá trị từ Claims trong token.
                var userId = Guid.Parse(jwtToken.Claims.First(x => x.Type == "userId").Value);
                var userName = jwtToken.Claims.First(x => x.Type == "userName").Value;
                var email = jwtToken.Claims.First(x => x.Type == "identifier").Value;

                return userId;
            }
            catch
            {
                return null;
            }
        }
    }
}
