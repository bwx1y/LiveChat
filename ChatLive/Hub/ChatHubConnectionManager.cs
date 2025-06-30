using System.Collections.Concurrent;

namespace ChatLive.Hub;

public interface IChatHubConnectionManager
{
    void AddUser(string userId, string connectionId);
    void RemoveUser(string userId, string connectionId);
    List<string> GetUserConnections(string userId);
    List<string> GetOnlineUsers();
}

public class ChatHubConnectionManager : IChatHubConnectionManager
{
    private static readonly ConcurrentDictionary<string, HashSet<string>> Connections = new();

    public void AddUser(string userId, string connectionId)
    {
        var connections = Connections.GetOrAdd(userId, _ => new HashSet<string>());
        lock (connections)
        {
            connections.Add(connectionId);
        }
    }

    public void RemoveUser(string userId, string connectionId)
    {
        if (Connections.TryGetValue(userId, out var connections))
        {
            lock (connections)
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                {
                    Connections.TryRemove(userId, out _);
                }
            }
        }
    }

    public List<string> GetUserConnections(string userId)
    {
        return Connections.TryGetValue(userId, out var connections) ? connections.ToList() : new List<string>();
    }

    public List<string> GetOnlineUsers()
    {
        return Connections.Keys.ToList();
    }
}