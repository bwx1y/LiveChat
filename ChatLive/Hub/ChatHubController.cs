using ChatLive.Context;
using ChatLive.Extension;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatLive.Hub;

public class ChatHubController(IChatHubConnectionManager connectionManager, ChatLiveContext context)
    : Microsoft.AspNetCore.SignalR.Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid parsedUserId))
        {
            await base.OnConnectedAsync();
            return;
        }

        connectionManager.AddUser(userId, Context.ConnectionId);
        
        await Clients.All.SendAsync("UserStatusChanged", new
        {
            userId, // ID user yang baru online
            status = true
        }.ToJson().ToBase64());
        
        await base.OnConnectedAsync();
    }


    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid parsedUserId))
        {
            await base.OnConnectedAsync();
        }

        connectionManager.RemoveUser(userId!, Context.ConnectionId);

        await Clients.All.SendAsync("UserStatusChanged", new
        {
            userId, 
            status = false
        }.ToJson().ToBase64());

        await base.OnDisconnectedAsync(exception);
    }
}