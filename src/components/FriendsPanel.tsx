import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Friend {
  id: number;
  nickname: string;
  username: string;
  status?: string;
}

interface FriendsPanelProps {
  userId: string;
  onStartChat: (friendId: number, friendName: string) => void;
}

export default function FriendsPanel({ userId, onStartChat }: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/846e9d6a-42a5-4034-8189-90d589c02a96', {
        headers: { 'X-User-Id': userId }
      });
      const data = await response.json();
      setFriends(data);
    } catch (err) {
      console.error('Error loading friends:', err);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/60a67547-2730-4d4f-9251-9409c3b811e6?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data.filter((u: Friend) => u.id !== parseInt(userId)));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    try {
      await fetch('https://functions.poehali.dev/846e9d6a-42a5-4034-8189-90d589c02a96', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ action: 'send_request', friend_id: friendId })
      });
      alert('Заявка отправлена!');
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      alert('Ошибка отправки заявки');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Друзья</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Icon name="UserPlus" size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить друга</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Введите юзернейм..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <Button onClick={searchUsers} disabled={loading}>
                    <Icon name="Search" size={18} />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium">{user.nickname}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                          <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
                            Добавить
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {friends.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-30" />
              <p>У вас пока нет друзей</p>
              <p className="text-sm mt-2">Найдите пользователей по юзернейму</p>
            </div>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onStartChat(friend.id, friend.nickname)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {friend.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{friend.nickname}</p>
                  <p className="text-sm text-muted-foreground truncate">@{friend.username}</p>
                </div>
                <Icon name="MessageCircle" size={18} className="text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
