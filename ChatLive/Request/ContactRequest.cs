namespace ChatLive.Request;

public static class ContactRequest
{
    public class AccRequest
    {
        public required Guid UserId { get; set; }
    }
    
    public class FollowRequest
    {
        public required Guid UserId { get; set; }
    }
}