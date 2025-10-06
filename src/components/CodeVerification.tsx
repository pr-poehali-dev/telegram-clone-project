import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface CodeVerificationProps {
  phone: string;
  onVerify: (code: string) => void;
  onBack: () => void;
}

export default function CodeVerification({ phone, onVerify, onBack }: CodeVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '')) {
      onVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newCode = [...code];
    
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    if (pastedData.length >= 6) {
      inputRefs.current[5]?.focus();
      onVerify(newCode.join(''));
    } else {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
      >
        <Icon name="ArrowLeft" size={20} className="mr-2" />
        Назад
      </Button>

      <div className="text-center mb-8 space-y-4">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="MessageSquare" size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Введите код</h1>
        <p className="text-muted-foreground">
          Мы отправили код подтверждения на номер
        </p>
        <p className="text-lg font-medium">{phone}</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold"
            />
          ))}
        </div>

        {timer > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Отправить код повторно через {timer} сек
          </p>
        ) : (
          <Button
            variant="link"
            onClick={handleResend}
            className="w-full"
          >
            Отправить код повторно
          </Button>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Не приходит SMS? Проверьте правильность номера
      </div>
    </div>
  );
}
