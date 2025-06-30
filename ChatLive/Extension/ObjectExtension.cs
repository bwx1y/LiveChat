namespace ChatLive.Extension;

public static class ObjectExtension
{
    public static string ToJson(this object obj)
    {
        return System.Text.Json.JsonSerializer.Serialize(obj);
    }
}