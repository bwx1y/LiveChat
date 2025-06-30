using System.Security.Claims;

namespace ChatLive.Extension;

public static class ClaimsPrincipalExtension
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        string? userId = principal.FindFirst(ClaimTypes.Sid)?.Value;
        
        if (userId == null) return Guid.Empty;
        
        return Guid.Parse(userId);
    }
}