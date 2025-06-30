using ChatLive.Context;
using ChatLive.Extension;
using ChatLive.Hub;
using ChatLive.Model;
using ChatLive.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController(ChatLiveContext context, IChatHubConnectionManager connectionManager, IHubContext<ChatHubController> hubContext) : ControllerBase
    {
        [HttpGet, Authorize]
        public async Task<IActionResult> Get()
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized();
            }

            var list = await context.Contact
                .Where(f => f.UserId == userId)
                .Select(f => new
                {
                    f.ToUser.Id,
                    f.ToUser.Name,
                    f.ToUser.Email,
                    f.ToUser.Picture,
                    IsFollback = context.Contact.Any(x => x.UserId == f.ToUserId && x.ToUserId == userId)
                })
                .ToListAsync();

            var onlineUser = connectionManager.GetOnlineUsers();
            
            return Ok(list.Select(f => new
            {
                f.Id,
                f.Name,
                f.Email,
                f.Picture,
                Acc = f.IsFollback,
                Status = onlineUser.Contains(f.Id.ToString())
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var userId = User.GetUserId();

            var targetUser = await context.User
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            if (targetUser == null)
            {
                ModelState.AddModelError("User", "User not found");
                return ValidationProblem(modelStateDictionary: ModelState, statusCode: 404);
            }

            bool enableAdd = false;

            if (userId != Guid.Empty && userId != id) // tidak bisa follow diri sendiri
            {
                enableAdd = !await context.Contact.AnyAsync(c => c.UserId == userId && c.ToUserId == id);
            }

            return Ok(new
            {
                targetUser.Id,
                targetUser.Name,
                targetUser.Email,
                targetUser.Picture,
                EnableAdd = enableAdd
            });
        }
        
        [HttpGet("Follower"), Authorize]
        public async Task<IActionResult> GetRequest()
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            // Ambil user yang mem-follow kita
            var incomingRequests = await context.Contact
                .Where(c => c.ToUserId == userId)
                .Select(c => c.User)
                .Distinct()
                .ToListAsync();

            // Ambil ID user yang sudah kita follow balik
            var alreadyFollowedBack = await context.Contact
                .Where(c => c.UserId == userId)
                .Select(c => c.ToUserId)
                .ToListAsync();

            // Filter: hanya yang belum kita follback
            var notFollowedBack = incomingRequests
                .Where(u => !alreadyFollowedBack.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Picture
                });

            return Ok(notFollowedBack);
        }

        [HttpGet("{id}/Chat"), Authorize]
        public async Task<IActionResult> GetChat(Guid id)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized();
            }

            var list = await context.Chat
                .Where(f => (f.FromId == userId && f.ToId == id) || (f.ToId == userId && f.FromId == id)).ToListAsync();

            return Ok(list.Select(f => new
            {
                f.Id,
                Form = f.FromId,
                To = f.ToId,
                f.Message,
                f.Created,
            }).OrderBy(f => f.Created).ToList());
        }

        [HttpPost("Follow"), Authorize]
        public async Task<IActionResult> Follow([FromBody] ContactRequest.FollowRequest request)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            // Tidak boleh follow diri sendiri
            if (userId == request.UserId)
            {
                ModelState.AddModelError("User", "You cannot follow yourself.");
                return ValidationProblem(modelStateDictionary: ModelState, statusCode: 404);
            }

            // Cek apakah target user ada
            var targetUser = await context.User
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (targetUser == null)
            {
                ModelState.AddModelError("User", "User not found");
                return ValidationProblem(modelStateDictionary: ModelState, statusCode: 404);
            }

            // Cek apakah sudah follow sebelumnya
            bool alreadyFollowing = await context.Contact.AnyAsync(c =>
                c.UserId == userId && c.ToUserId == request.UserId);

            if (alreadyFollowing)
            {
                ModelState.AddModelError("User", "You are already following this user.");
                return ValidationProblem(modelStateDictionary: ModelState, statusCode: 404);
            }

            // Tambahkan ke database
            var newContact = new Contact
            {
                UserId = userId,
                ToUserId = request.UserId
            };

            context.Contact.Add(newContact);
            await context.SaveChangesAsync();

            // Cek apakah dia follback kita
            bool isFollback = await context.Contact.AnyAsync(c =>
                c.UserId == request.UserId && c.ToUserId == userId);

            // Cek status online
            var isOnline = connectionManager
                .GetOnlineUsers()
                .Any(x => x == request.UserId.ToString());

            var user = context.User.First(f => f.Id == userId);
            await hubContext.Clients.User(request.UserId.ToString())
                .SendAsync("UpdateContact", new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                picture = user.Picture,
                acc = isFollback,
                status = connectionManager.GetOnlineUsers().Any(x => x == userId.ToString())
            }.ToJson().ToBase64());
            
            // Response
            return Ok(new
            {
                targetUser.Id,
                targetUser.Name,
                targetUser.Email,
                targetUser.Picture,
                Acc = isFollback,
                Status = isOnline
            });
        }
    }
}
