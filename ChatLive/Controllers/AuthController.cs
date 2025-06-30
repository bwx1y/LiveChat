using System.Net;
using System.Text.Json;
using ChatLive.Context;
using ChatLive.Extension;
using ChatLive.Model;
using ChatLive.Request;
using ChatLive.Service;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ChatLiveContext context, IConfiguration config) : ControllerBase
    {
        private readonly string _key = config["Jwt:Key"] ?? "lNi7dgUa6oy8KWZwnZuuNxTszn3IaJhw";
        private readonly int _exp = int.Parse(config["Jwt:Exp"] ?? "60");
        private readonly string? _googleClientId = config["GoogleOAuth:ClientId"];
        private readonly string? _googleClientSecret = config["GoogleOAuth:ClientSecret"];
        private readonly string? _googleClientRedirectUri = config["GoogleOAuth:RedirectUri"];
        private readonly string[] _googleScopes = new[] {
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        };
        
        [HttpPost("Login")]
        public async Task<IActionResult> Login(AuthRequest.LoginRequest request)
        {
            var find = await context.User.FirstOrDefaultAsync(f => f.Email == request.Email && f.Password == request.Password.ToMd5());
            if (find == null)
            {
                ModelState.AddModelError("User", "User not found.");
                return ValidationProblem(modelStateDictionary:ModelState, statusCode: 401);
            } 
            
            return Ok(new
            {
                find.Id,
                find.Email,
                find.Name,
                find.Picture,
                Token = new
                {
                    Key = find.GenerateToken(secretKey: _key, expiresIn: _exp),
                    Exp = DateTime.UtcNow.AddMinutes(_exp),
                    Profider = "Bearer"
                }
            });
        }

        [HttpGet("Login-Gmail")]
        public IActionResult LoginGmail()
        {
            if (_googleClientId == null || _googleClientSecret == null || _googleClientRedirectUri == null) return Redirect("/");
            
            var url = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                      $"response_type=code&" +
                      $"client_id={_googleClientId}&" +
                      $"redirect_uri={_googleClientRedirectUri}&" +
                      $"scope={Uri.UnescapeDataString(string.Join(" ", _googleScopes))}&" +
                      $"access_type=offline&" +
                      $"prompt=consent";

            return Ok(new
            {
                Url = url
            });
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(AuthRequest.RegisterRequest request)
        {
            var find = await context.User.FirstOrDefaultAsync(f => f.Email == request.Email);
            if (find != null)
            {
                ModelState.AddModelError("User", "User already exists.");
                return ValidationProblem(modelStateDictionary:ModelState, statusCode: 401);
            }
            
            var created = await context.User.AddAsync(request.Adapt<User>().HashPassword());
            await context.SaveChangesAsync();
            
            return Ok(new
            {
                created.Entity.Id,
                created.Entity.Email,
                created.Entity.Name,
                created.Entity.Picture,
                Token = new
                {
                    Key = created.Entity.GenerateToken(secretKey: _key, expiresIn: _exp),
                    Exp = DateTime.UtcNow.AddMinutes(_exp),
                    Profider = "Bearer"
                }
            });
        }

        [HttpPost("Callback-Gmail")]
        public async Task<IActionResult> CallbackGmail(AuthRequest.LoginGmailRequest request)
        {
            if (_googleClientId == null || _googleClientSecret == null || _googleClientRedirectUri == null) return Redirect("/");

            var googleService = new GoogleService(clientId: _googleClientId, clientSecret: _googleClientSecret,  redirectUri: _googleClientRedirectUri);
            await googleService.GetToken(request.Code);

            var response = await googleService.GetUserInfo();
            if (response == null)
            {
                ModelState.AddModelError("Google", "Not Connect Google");
                return ValidationProblem(modelStateDictionary:ModelState, statusCode: 401);
            }
            
            var find = context.User.FirstOrDefault(f => f.Email == response.email);
            if (find != null)
            {
                return Ok(new
                {
                    find.Id,
                    find.Email,
                    find.Name,
                    find.Picture,
                    Token = new
                    {
                        Key = find.GenerateToken(secretKey: _key, expiresIn: _exp),
                        Exp = DateTime.UtcNow.AddDays(_exp),
                        Profider = "Bearer"
                    }
                });
            }
            
            var user = context.User.Add(new User
            {
                Email = response.email,
                Name = response.name,
                Picture = response.picture,
                Password = $"{Guid.NewGuid()}-{Guid.NewGuid()}"
            });
            await context.SaveChangesAsync();
            
            return Ok(new 
            {
                user.Entity.Id,
                user.Entity.Email,
                user.Entity.Name,
                user.Entity.Picture,
                Token = new
                {
                    Key = user.Entity.GenerateToken(secretKey: _key, expiresIn: _exp),
                    Exp = DateTime.UtcNow.AddDays(_exp),
                    Profider = "Bearer"
                }
            });
        }

        [HttpGet("Me"), Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized();
            }
            
            var find = await context.User.FirstOrDefaultAsync(f => f.Id == userId);
            if (find == null)
            {
                return Unauthorized();
            }

            return Ok(new
            {
                find.Id,
                find.Email,
                find.Name,
                find.Picture
            });
        }
    }
}
