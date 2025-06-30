using System.ComponentModel.DataAnnotations;

namespace ChatLive.Request;

public static class AuthRequest
{
    public class LoginRequest
    {
        [EmailAddress, MaxLength(100)]
        public required string Email { get; set; }
        [MaxLength(100)]
        public required string Password { get; set; }
    }
    
    public class RegisterRequest
    {
        [MaxLength(100)]
        public required string Name { get; set; }
        [EmailAddress, MaxLength(100)]
        public required string Email { get; set; }
        [MaxLength(100)]
        public required string Password { get; set; }
        [MaxLength(100)]
        public required string ConfirmPassword { get; set; }
    }
    
    public class LoginGmailRequest
    {
        public required string Code { get; set; }
    }
}