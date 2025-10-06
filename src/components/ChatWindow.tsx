import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
}

interface ChatWindowProps {
  chatName: string;
  chatOnline?: boolean;
}

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', time: '14:28', isMine: false },
  { id: 2, text: 'Привет! Всё отлично, спасибо! А у тебя?', time: '14:29', isMine: true },
  { id: 3, text: 'Тоже хорошо! Хотел спросить про проект', time: '14:29', isMine: false },
  { id: 4, text: 'Да, конечно! Слушаю', time: '14:30', isMine: true },
  { id: 5, text: 'Когда планируем запуск новой версии?', time: '14:30', isMine: false },
];

export default function ChatWindow({ chatName, chatOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chatName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{chatName}</h2>
          <p className="text-xs text-muted-foreground">
            {chatOnline ? 'в сети' : 'был(а) недавно'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Phone" size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Video" size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="MoreVertical" size={20} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                message.isMine ? "justify-end" : "justify-start"
              )}
            >
              {!message.isMine && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-secondary text-xs">
                    {chatName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2",
                message.isMine 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-secondary text-foreground rounded-bl-sm"
              )}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className={cn(
                  "text-xs mt-1 block",
                  message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
            <Icon name="Plus" size={20} />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Введите сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20 bg-secondary border-none min-h-[44px] resize-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Icon name="Paperclip" size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Icon name="Smile" size={18} />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="icon"
            className="rounded-full flex-shrink-0 h-11 w-11"
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
