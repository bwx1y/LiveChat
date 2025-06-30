using System.Net.Http.Headers;
using System.Text.Json;

namespace ChatLive.Service;

public class GoogleService(string clientId, string clientSecret, string redirectUri)
{
    private HttpClient _httpClient = new();
    private string? _access_token = null;
    public class GoogleTokenResponse
    {
        public string access_token { get; set; }
        public int expires_in { get; set; }
        public string refresh_token { get; set; }
        public string scope { get; set; }
        public string token_type { get; set; }
        public string id_token { get; set; }
    }
    public class GoogleUserInfo
    {
        public string id { get; set; }
        public string email { get; set; }
        public string verified_Email { get; set; }
        public string name { get; set; }
        public string given_Name { get; set; }
        public string family_Name { get; set; }
        public string picture { get; set; }
        public string locale { get; set; }
    }
    
    public async Task<GoogleTokenResponse?> GetToken(string code)
    {
        var dict = new Dictionary<string, string>
        {
            { "code", code },
            { "client_id", clientId },
            { "client_secret", clientSecret },
            { "redirect_uri", redirectUri },
            { "grant_type", "authorization_code" }
        };
        var response = await _httpClient.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(dict)
        );

        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GoogleTokenResponse>(json);
            _access_token = result?.access_token;
            return result;
        }
        
        return null;
    }

    public async Task<GoogleUserInfo?> GetUserInfo()
    {
        if (_access_token == null) return null;
        
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _access_token);
        var response = await _httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");

        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GoogleUserInfo>(json);
            return result;
        }

        return null;
    } 
}