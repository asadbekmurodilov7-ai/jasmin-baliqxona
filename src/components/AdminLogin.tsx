import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Check, X, Terminal } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string, token: string) => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail) {
      setError("Iltimos, email manzilingizni kiriting!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formattedEmail })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSentEmail(formattedEmail);
        if (data.devCode) setDevCode(data.devCode);
        setStep('otp');
      } else {
        setError(data.error || "Kod yuborishda xatolik yuz berdi!");
      }
    } catch {
      setError("Server bilan aloqada xatolik!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formattedCode = code.trim();
    const formattedPin = pin.trim();

    if (!formattedCode || !formattedPin) {
      setError("Barcha maydonlarni to'ldiring!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, code: formattedCode, pin: formattedPin })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => onLoginSuccess(sentEmail, data.token || ''), 1200);
      } else {
        setError(data.error || "Kirish ruxsatnomasi tasdiqlanmadi!");
      }
    } catch {
      setError("Ulanish xatoligi yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-full blur-xs"></div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 shadow-md">
            {success ? (
              <ShieldCheck className="h-8 w-8 text-green-500 animate-bounce" />
            ) : step === 'otp' ? (
              <KeyRound className="h-7 w-7 text-amber-500 animate-pulse" />
            ) : (
              <Lock className="h-7 w-7 text-red-500" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {step === 'otp' ? 'Xavfsiz Kirish Kodlari' : 'Admin Tizimiga Kirish'}
            </h2>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              {step === 'otp'
                ? `${sentEmail} uchun kod server konsolida ko'rsatildi. PIN-kod va kodni kiriting.`
                : "Ushbu bo'lim faqat belgilangan administratorlar uchun himoyalangan."}
            </p>
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-left">
                Admin email manzilingiz:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@jasmin.uz"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/70 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-left">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 text-xs pt-2">
              <button type="button" onClick={onCancel}
                className="flex-1 py-3 font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-2xl transition-all cursor-pointer">
                Orqaga
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                <span>{isLoading ? "Yuborilmoqda..." : "Kod olish"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyLogin} className="mt-6 space-y-4">

            {/* Dev mode OTP display */}
            {devCode ? (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5">
                <Terminal className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Demo rejim — Tasdiqlash kodi</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-amber-300 tracking-widest bg-zinc-950 px-3 py-1.5 rounded-lg border border-amber-500/30 select-all">
                      {devCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setCode(devCode); }}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Joylashtir
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 flex items-start gap-2.5">
                <Terminal className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Server konsoli</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    6 xonali OTP kod server terminal oynasida ko'rsatilgan.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-left">
                Tasdiqlash kodi (6 xonali):
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); if (error) setError(null); }}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-mono font-black text-white tracking-widest placeholder-zinc-500 focus:outline-none focus:border-amber-500/70 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-left">
                PIN-kod:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="PIN-kodni kiriting"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); if (error) setError(null); }}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/70 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-left">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-950/30 border border-green-500/30 text-green-400 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Muvaffaqiyatli tasdiqlandi. Kirilmoqda...</span>
              </div>
            )}

            <div className="flex gap-3 text-xs pt-1.5">
              <button type="button" onClick={() => { setStep('email'); setError(null); setCode(''); setPin(''); }}
                className="flex-1 py-3 font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-2xl transition-all cursor-pointer">
                Orqaga
              </button>
              <button type="submit" disabled={isLoading || success}
                className="flex-1 py-3 font-bold text-black rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: '#f59e0b' }}>
                <span>{isLoading ? "Tekshirilmoqda..." : "Tizimga Kirish"}</span>
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        <button onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
