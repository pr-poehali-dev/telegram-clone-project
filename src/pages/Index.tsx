import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PhoneInput from '@/components/PhoneInput';
import CodeVerification from '@/components/CodeVerification';
import UsernameSetup from '@/components/UsernameSetup';
import FriendsPanel from '@/components/FriendsPanel';
import ChatWindow from '@/components/ChatWindow';

type AuthStep = 'phone' | 'code' | 'setup' | 'authorized';

export default function Index() {
  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFriend, setSelectedFriend] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const nickname = localStorage.getItem('userNickname');
    const username = localStorage.getItem('userUsername');
    
    if (userId && nickname && username) {
      setCurrentUser({ id: userId, nickname, username });
      setAuthStep('authorized');
    }
  }, []);

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setAuthStep('code');
  };

  const handleCodeVerify = (userExists: boolean, userData?: any) => {
    if (userExists) {
      setCurrentUser(userData);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userNickname', userData.nickname);
      localStorage.setItem('userUsername', userData.username);
      setAuthStep('authorized');
    } else {
      setAuthStep('setup');
    }
  };

  const handleUsernameSetup = async (nickname: string, username: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/60a67547-2730-4d4f-9251-9409c3b811e6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, nickname, username })
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser({ id: data.id, nickname, username });
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userNickname', nickname);
        localStorage.setItem('userUsername', username);
        setAuthStep('authorized');
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleBackToPhone = () => {
    setAuthStep('phone');
  };

  const handleStartChat = (friendId: number, friendName: string) => {
    setSelectedFriend({ id: friendId, name: friendName });
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setAuthStep('phone');
    setSelectedFriend(null);
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

  if (authStep === 'setup') {
    return (
      <div className="h-screen flex items-center justify-center bg-secondary/30">
        <UsernameSetup
          phone={phoneNumber}
          onComplete={handleUsernameSetup}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-full md:w-96 flex-shrink-0 border-r border-border bg-white">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{currentUser?.nickname}</h2>
            <p className="text-sm text-muted-foreground">@{currentUser?.username}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
            <Icon name="LogOut" size={18} />
          </Button>
        </div>

        <Tabs defaultValue="friends" className="h-[calc(100vh-88px)]">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="friends">Друзья</TabsTrigger>
            <TabsTrigger value="groups">Группы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="h-full m-0">
            <FriendsPanel userId={currentUser?.id} onStartChat={handleStartChat} />
          </TabsContent>
          
          <TabsContent value="groups" className="h-full m-0">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-4">
                <Icon name="Users" size={48} className="mx-auto opacity-30" />
                <p>Функционал групп</p>
                <p className="text-sm">Скоро будет доступен</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <ChatWindow 
            chatName={selectedFriend.name}
            chatOnline={false}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-secondary/30">
            <div className="text-center space-y-4 p-8">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Выберите друга</h2>
              <p className="text-muted-foreground max-w-md">
                Добавьте друзей по юзернейму и начните общение
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
