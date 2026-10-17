'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('denish_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    const res = await fetchApi<{ user: User }>('/user');
    if (res.data?.user) {
      setUser(res.data.user);
    } else {
      // If token expired or invalid
      localStorage.removeItem('denish_token');
      localStorage.removeItem('denish_user');
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Check saved user in local storage for fast hydration
    const savedUser = localStorage.getItem('denish_user');
    const savedToken = localStorage.getItem('denish_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        // ignore
      }
    }
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('denish_token', res.data.token);
      localStorage.setItem('denish_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }

    return { success: false, error: res.error || 'Login gagal' };
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await fetchApi<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('denish_token', res.data.token);
      localStorage.setItem('denish_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }

    return { success: false, error: res.error || 'Autentikasi Google gagal' };
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await fetchApi<{ token: string; user: User }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('denish_token', res.data.token);
      localStorage.setItem('denish_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }

    return { success: false, error: res.error || 'Registrasi gagal' };
  };

  const logout = async () => {
    try {
      await fetchApi('/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('denish_token');
    localStorage.removeItem('denish_user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
