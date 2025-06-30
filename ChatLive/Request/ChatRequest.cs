namespace ChatLive.Request;

public static class ChatRequest
{
    public class Reqeust
    {
        public required Guid ToUserId { get; set; }
        public required string Message { get; set; }
    }
}