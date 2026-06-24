import React, { useState } from 'react';
import { Lock, ShieldCheck, ShieldAlert, X } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string, token: string) => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) { setError("PIN kiritilmadi!"); return; }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => onLoginSuccess('admin', data.token || ''), 1000);
      } else {
        setError(data.error || "PIN noto'g'ri!");
      }
    } catch {
      setError("Server bilan ulanishda xatolik!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-xs w-full shadow-2xl relative">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-full blur-xs"></div>

        <button onClick={onCancel} className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-all">
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="h-14 w-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center">
            {success
              ? <ShieldCheck className="h-8 w-8 text-green-500 animate-bounce" />
              : <Lock className="h-7 w-7 text-red-500" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Admin Kirish</h2>
            <p className="text-zinc-400 text-xs mt-1">PIN-kodni kiriting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            placeholder="● ● ● ●"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(null); }}
            autoFocus
            className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-red-500/70 transition-all"
          />

          {error && (
            <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-950/30 border border-green-500/30 text-green-400 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
              <ShieldCheck className="h-4 w-4" />
              Kirilmoqda...
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all text-xs cursor-pointer">
              Bekor
            </button>
            <button type="submit" disabled={isLoading || success}
              className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all text-xs disabled:opacity-50 cursor-pointer">
              {isLoading ? "..." : "Kirish"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
