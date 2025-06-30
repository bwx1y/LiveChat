using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatLive.Model;

[Table("users")]
public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Email { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    public string? Picture { get; set; }
    
    public virtual ICollection<Contact> Following { get; set; } = new List<Contact>();
    
    public virtual ICollection<Contact> Followers { get; set; } = new List<Contact>();
    
    public virtual ICollection<Chat> SentMessage { get; set; } = new List<Chat>();
    
    public virtual ICollection<Chat> ReceivedMessage { get; set; } = new List<Chat>();
}
