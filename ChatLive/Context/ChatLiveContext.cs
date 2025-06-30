using ChatLive.Model;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;

namespace ChatLive.Context;

public class ChatLiveContext(DbContextOptions<ChatLiveContext> options) : DbContext(options)
{
    public DbSet<User> User { get; set; }
    public DbSet<Chat> Chat { get; set; }
    public DbSet<Contact> Contact { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.From)
            .WithMany(u => u.SentMessage)
            .HasForeignKey(c => c.FromId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Chat>()
            .HasOne(c => c.To)
            .WithMany(u => u.ReceivedMessage)
            .HasForeignKey(c => c.ToId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Contact>()
            .HasOne(c => c.User)
            .WithMany(u => u.Following)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contact>()
            .HasOne(c => c.ToUser)
            .WithMany(u => u.Followers)
            .HasForeignKey(c => c.ToUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}