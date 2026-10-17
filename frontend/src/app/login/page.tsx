'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(res.error || 'Email atau kata sandi tidak sesuai.');
    }
    setIsSubmitting(false);
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError(null);
    setIsSubmitting(true);
    const res = await loginWithGoogle(credential);
    if (res.success) {
      if (res.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Login dengan Google gagal.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-brand-yellow shadow-md bg-white">
          <img src="/logo.png" alt="De'nish Cookies" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-heading font-black text-2xl text-brand-indigo">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Nikmati kemudahan checkout cepat, simpan alamat, dan lacak pesanan kue Anda.
        </p>
      </div>

      {/* Main Login Form */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
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
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Kata Sandi (Password)
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-yellow justify-center py-3 text-xs sm:text-sm font-black disabled:opacity-60 min-h-[44px] shadow-md transition active:scale-[0.98]"
          >
            {isSubmitting ? 'Memeriksa Akun...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">Atau masuk dengan</span>
          </div>
        </div>

        <GoogleSignInButton
          text="signin_with"
          onSuccess={handleGoogleSuccess}
          onError={(err) => setError(err)}
        />

        <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-brand-red hover:underline">
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
