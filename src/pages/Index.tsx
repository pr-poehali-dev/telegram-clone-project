import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';
import PhoneInput from '@/components/PhoneInput';
import CodeVerification from '@/components/CodeVerification';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
}

type AuthStep = 'phone' | 'code' | 'authorized';

export default function Index() {
  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileChatListOpen, setIsMobileChatListOpen] = useState(true);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMobileChatListOpen(false);
  };

  const handleBackToChats = () => {
    setIsMobileChatListOpen(true);
    setSelectedChat(null);
  };

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setAuthStep('code');
  };

  const handleCodeVerify = (code: string) => {
    console.log('Verifying code:', code);
    setAuthStep('authorized');
  };

  const handleBackToPhone = () => {
    setAuthStep('phone');
  };

  if (authStep === 'phone') {
    return (
      <div className="h-screen flex items-center justify-center bg-secondary/30">
        <PhoneInput onSubmit={handlePhoneSubmit} />
      </div>
    );
  }

  if (authStep === 'code') {
    return (
      <div className="h-screen flex items-center justify-center bg-secondary/30">
        <CodeVerification
          phone={phoneNumber}
          onVerify={handleCodeVerify}
          onBack={handleBackToPhone}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${!isMobileChatListOpen && selectedChat ? 'hidden md:block' : 'block'}`}>
        <ChatList 
          onChatSelect={handleChatSelect} 
          selectedChatId={selectedChat?.id}
        />
      </div>

      <div className={`flex-1 ${isMobileChatListOpen || !selectedChat ? 'hidden md:flex' : 'flex'} flex-col`}>
        {selectedChat ? (
          <>
            <div className="md:hidden p-2 border-b border-border bg-white">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleBackToChats}
                className="rounded-full"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
            </div>
            <div className="flex-1 flex">
              <div className="flex-1">
                <ChatWindow 
                  chatName={selectedChat.name}
                  chatOnline={selectedChat.online}
                />
              </div>
              <Sidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full z-30 bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <Icon name={isSidebarOpen ? "X" : "Menu"} size={20} />
            </Button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-secondary/30">
            <div className="text-center space-y-4 p-8">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Выберите чат</h2>
              <p className="text-muted-foreground max-w-md">
                Выберите чат из списка слева, чтобы начать общение
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}