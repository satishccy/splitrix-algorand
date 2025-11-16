import { MoreVertical, MessageCircle, Send, Trash2 } from "lucide-react";

interface FriendsListProps {
  searchQuery: string;
  friends?: any[];
  loading?: boolean;
  onRemoveFriend?: (friendAddress: string) => void;
  currentAddress?: string;
}

export function FriendsList({ searchQuery, friends = [], loading = false, onRemoveFriend, currentAddress }: FriendsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading friends...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No friends found. Add some friends to get started!</p>
      </div>
    );
  }

  // Format friends from API to display format
  const formattedFriends = friends.map((friend: any, index: number) => {
    const address = friend.friendAddress || "";
    const nickname = friend.nickname || "";
    const initials = nickname
      ? nickname
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : address.slice(0, 2).toUpperCase();

    return {
      id: index,
      friendAddress: address,
      nickname: nickname || address.slice(0, 8) + "...",
      avatar: initials,
      name: nickname || address.slice(0, 8) + "...",
      address: address,
    };
  });

  const filteredFriends = formattedFriends.filter((friend: any) => {
    const searchLower = searchQuery.toLowerCase();
    const friendAddress = friend.friendAddress || "";
    const nickname = friend.nickname || "";
    return friendAddress.toLowerCase().includes(searchLower) || nickname.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-3">
      {filteredFriends.length === 0 ? (
        <div className="glass rounded-xl p-12 border border-border text-center">
          <p className="text-muted-foreground">No friends found</p>
        </div>
      ) : (
        filteredFriends.map((friend) => (
          <div key={friend.id} className="glass rounded-xl p-4 border border-border hover:border-primary/50 transition-all group">
            <div className="flex items-start justify-between">
              {/* Friend Info */}
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{friend.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1">{friend.nickname || friend.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 font-mono">{friend.friendAddress}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="text-right ml-4">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onRemoveFriend && (
                    <button
                      onClick={() => onRemoveFriend(friend.friendAddress)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Remove friend"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
