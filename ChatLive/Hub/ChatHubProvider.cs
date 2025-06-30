using System.Security.Claims;
using ChatLive.Extension;
using Microsoft.AspNetCore.SignalR;

namespace ChatLive.Hub;

public class ChatHubProvider: IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        return connection.User.FindFirst(ClaimTypes.Sid)!.Value;
    }
}