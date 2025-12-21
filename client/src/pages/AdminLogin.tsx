import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [pin, setPin] = useState('');

  const validatePin = () => {
    const now = new Date();
    const day = now.getDate();
    const minutes = now.getMinutes();
    const correctPin = 4020 + day + minutes;
    
    if (parseInt(pin) === correctPin) {
      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      toast.error('Código incorrecto');
      setPin('');
    }
  };

  const handleNumClick = (num: string) => {
    if (pin.length < 6) setPin(pin + num);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center text-[#DC241F]">Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-2xl font-mono h-12 flex items-center justify-center border-2 rounded">
            {pin.split('').map((_, i) => <span key={i}>*</span>)}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <Button key={n} variant="outline" onClick={() => handleNumClick(n.toString())}>{n}</Button>
            ))}
            <Button variant="outline" onClick={() => setPin('')}>C</Button>
            <Button variant="outline" onClick={() => handleNumClick('0')}>0</Button>
            <Button className="bg-[#DC241F]" onClick={validatePin}>✓</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
