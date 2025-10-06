import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
}

const mockChats: Chat[] = [
  { id: 1, name: 'Анна Смирнова', lastMessage: 'Привет! Как дела?', time: '14:30', unread: 2, online: true },
  { id: 2, name: 'Максим Петров', lastMessage: 'Встретимся завтра?', time: '13:15', online: true },
  { id: 3, name: 'Дизайн Команда', lastMessage: 'Новый макет готов', time: '12:00', unread: 5 },
  { id: 4, name: 'Елена Иванова', lastMessage: 'Отлично, спасибо!', time: '11:45' },
  { id: 5, name: 'React Разработчики', lastMessage: 'Кто-нибудь знает как...', time: 'Вчера', unread: 1 },
  { id: 6, name: 'Мария Козлова', lastMessage: 'До встречи!', time: 'Вчера' },
  { id: 7, name: 'Frontend Чат', lastMessage: 'Новый релиз вышел', time: 'Пн' },
  { id: 8, name: 'Алексей Новikov', lastMessage: 'Понял, сделаю', time: 'Пн' },
];

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: number;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Чаты</h1>
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-none"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left",
                selectedChatId === chat.id && "bg-secondary"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{chat.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>

              {chat.unread && chat.unread > 0 && (
                <div className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
