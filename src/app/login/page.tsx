'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Login gagal.');
    }
    setIsSubmitting(false);
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsSubmitting(true);
    setError(null);

    const res = await login(demoEmail, 'password123');
    if (res.success) {
      if (res.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Quick login gagal.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-brand-yellow shadow-md bg-white">
          <img src="/logo.jpg" alt="De'nish Cookies" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-heading font-black text-2xl text-brand-indigo">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-gray-500">
          Nikmati kemudahan checkout cepat, simpan alamat, dan lacak pesanan kue Anda.
        </p>
      </div>

      {/* Quick Demo Login Presets */}
      <div className="bg-amber-50 p-4 rounded-3xl border border-brand-yellow/40 space-y-2.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-red" /> Demo 1-Click Login:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('pembeli@gmail.com')}
            className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-xl text-left transition text-xs shadow-sm"
          >
            <span className="font-bold text-brand-indigo block">Sebagai Pembeli</span>
            <span className="text-[10px] text-gray-500">pembeli@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@denishcookies.com')}
            className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-xl text-left transition text-xs shadow-sm"
          >
            <span className="font-bold text-brand-indigo block flex items-center gap-1">
              <Shield className="w-3 h-3 text-brand-red" /> Admin Bakery
            </span>
            <span className="text-[10px] text-gray-500">admin@denishcookies.com</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-yellow justify-center py-3 text-xs font-black disabled:opacity-60"
          >
            {isSubmitting ? 'Memeriksa Akun...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-brand-red hover:underline">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
