using ChatLive.Context;
using ChatLive.Extension;
using ChatLive.Hub;
using ChatLive.Model;
using ChatLive.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController, Authorize]
    public class ChatController(ChatLiveContext context, IHubContext<ChatHubController> hubContext) : ControllerBase
    {
        [HttpPost, Authorize]
        public async Task<IActionResult> Create(ChatRequest.Reqeust request)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized();
            }
            
            var find = context.User.FirstOrDefault(x => x.Id == request.ToUserId);
            if (find == null)
            {
                ModelState.AddModelError("User", "User not found");
                return ValidationProblem(modelStateDictionary: ModelState, statusCode: 404);
            }

            var result = context.Chat.Add(new Chat
            {
                FromId = userId,
                ToId = find.Id,
                Message = request.Message,
                Created = DateTime.Now,
            });
            await context.SaveChangesAsync();

            await hubContext.Clients.User(find.Id.ToString()).SendAsync("ReceiveMessage", new
            {
                result.Entity.Id,
                result.Entity.Message,
                result.Entity.Created,
                Form = result.Entity.FromId,
                To = result.Entity.ToId,
            }.ToJson().ToBase64());
            
            return Created("", new
            {
                result.Entity.Id,
                result.Entity.Message,
                result.Entity.Created,
                Form = result.Entity.FromId,
                To = result.Entity.ToId,
            });
        }
    }
}
