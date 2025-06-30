using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatLive.Model;

[Table("chat")]
public class Chat
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    public required Guid FromId { get; set; }
    public virtual User From { get; set; } = null!;

    public virtual Guid ToId { get; set; }
    public virtual User To { get; set; } = null!;

    public required string Message { get; set; }
    public required DateTime Created { get; set; }
}