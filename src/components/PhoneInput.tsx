import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
}

export default function PhoneInput({ onSubmit }: PhoneInputProps) {
  const [phone, setPhone] = useState('');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7`;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      onSubmit(phone);
    }
  };

  const isValid = phone.replace(/\D/g, '').length === 11;

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8 space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="Phone" size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Вход в мессенджер</h1>
        <p className="text-muted-foreground">
          Введите номер телефона для входа или регистрации
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Номер телефона</label>
          <Input
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={handleChange}
            className="text-lg h-14 text-center tracking-wider"
            maxLength={18}
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-center">
            Мы отправим SMS с кодом подтверждения
          </p>
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full h-12 text-base"
        >
          Продолжить
          <Icon name="ArrowRight" size={20} className="ml-2" />
        </Button>
      </form>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Нажимая «Продолжить», вы принимаете условия использования
      </div>
    </div>
  );
}
