import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface UsernameSetupProps {
  phone: string;
  onComplete: (nickname: string, username: string) => void;
}

export default function UsernameSetup({ phone, onComplete }: UsernameSetupProps) {
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUsername = (value: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Введите никнейм');
      return;
    }

    if (!validateUsername(username)) {
      setError('Юзернейм должен содержать 3-20 символов (латиница, цифры, _)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/60a67547-2730-4d4f-9251-9409c3b811e6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, nickname, username })
      });

      const data = await response.json();

      if (response.ok) {
        onComplete(nickname, username);
      } else {
        setError(data.error || 'Ошибка при создании профиля');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8 space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="UserCircle" size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Создайте профиль</h1>
        <p className="text-muted-foreground">
          Выберите никнейм и юзернейм для вашего аккаунта
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nickname">Никнейм</Label>
          <Input
            id="nickname"
            placeholder="Как вас называть?"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-12"
            maxLength={100}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Отображается в чатах и контактах
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Юзернейм</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="h-12 pl-8"
              maxLength={20}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Используется для поиска и добавления в друзья
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !nickname.trim() || !username.trim()}
          className="w-full h-12 text-base"
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Создание профиля...
            </>
          ) : (
            <>
              Продолжить
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-secondary rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Важно:</strong> Никнейм и юзернейм должны быть уникальными. После создания изменить их будет нельзя.
        </p>
      </div>
    </div>
  );
}
