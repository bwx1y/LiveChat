using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatLive.Model;

[Table("contact")]
public class Contact
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    // Follower
    public required Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;
    // Following
    public required Guid ToUserId { get; set; }
    public virtual User ToUser { get; set; } = null!;
}