using System.Security.Cryptography;
using System.Text;

namespace ChatLive.Extension;

public static class StringExtension
{
    public static string ToMd5(this string str) => string.Join("",
        MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(str)).Select(f => f.ToString("x2")));
    
    public static string ToBase64(this string str)
    {
        var bytes = Encoding.UTF8.GetBytes(str);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}