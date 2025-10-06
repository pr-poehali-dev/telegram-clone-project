import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Contact {
  id: number;
  name: string;
  status?: string;
  online?: boolean;
}

const mockContacts: Contact[] = [
  { id: 1, name: 'Анна Смирнова', status: 'В сети', online: true },
  { id: 2, name: 'Максим Петров', status: 'В сети', online: true },
  { id: 3, name: 'Елена Иванова', status: 'Был(а) недавно' },
  { id: 4, name: 'Мария Козлова', status: 'Был(а) 2 часа назад' },
  { id: 5, name: 'Алексей Новиков', status: 'Был(а) вчера' },
  { id: 6, name: 'Ольга Петрова', status: 'В сети', online: true },
  { id: 7, name: 'Дмитрий Сидоров', status: 'Был(а) 3 дня назад' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('contacts');

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white border-l border-border z-50 animate-slide-in-right",
        "lg:relative lg:w-80"
      )}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Меню</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts">Контакты</TabsTrigger>
              <TabsTrigger value="profile">Профиль</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="contacts" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {mockContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{contact.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="profile" className="flex-1 m-0">
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    ВЫ
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">Ваше Имя</h3>
                  <p className="text-sm text-muted-foreground">В сети</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Icon name="User" size={18} />
                  Изменить профиль
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Icon name="Settings" size={18} />
                  Настройки
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Icon name="Bell" size={18} />
                  Уведомления
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Icon name="Moon" size={18} />
                  Тёмная тема
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive">
                  <Icon name="LogOut" size={18} />
                  Выйти
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
