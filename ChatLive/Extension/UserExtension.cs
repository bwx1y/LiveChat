using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChatLive.Model;
using Microsoft.IdentityModel.Tokens;

namespace ChatLive.Extension;

public static class UserExtension
{
    public static string GenerateToken(this User user, string secretKey, int expiresIn)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Sid, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiresIn),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),SecurityAlgorithms.HmacSha256)
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static User HashPassword(this User user)
    {
        user.Password = user.Password.ToMd5();
        return user;
    }
}