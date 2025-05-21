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
using ComicParadise.DataContext.Models;

namespace ComicParadise.Repository
{
    public class TokenRespon
    {
        private readonly IConfiguration _config;
        public TokenRespon(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
                new Claim("username", user.Username ?? ""),
                new Claim("identifier", user.Email ?? user.Phone ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }



        public int? ValidateJwtToken(string? token)
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
                var userId = int.Parse(jwtToken.Claims.First(x => x.Type == JwtRegisteredClaimNames.Sub).Value);
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
