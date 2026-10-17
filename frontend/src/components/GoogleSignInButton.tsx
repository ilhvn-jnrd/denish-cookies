'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleSignInButton({
  text = 'signin_with',
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '828855005140-m7rdk1pn0dq2dtvujklb3v33uq4oedq8.apps.googleusercontent.com';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => onError?.('Gagal memuat layanan Google Identity.');
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return;

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Gagal mendapatkan kredensial dari Google.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear container before rendering
        containerRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: text,
          shape: 'pill',
          logo_alignment: 'left',
          width: 320,
        });
      }
    } catch (err) {
      console.error('Google Sign-In initialization error:', err);
    }
  }, [scriptLoaded, clientId, text, onSuccess, onError]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      <div ref={containerRef} className="flex justify-center min-h-[44px] items-center" />
      {!scriptLoaded && (
        <div className="w-[320px] h-[40px] rounded-full border border-gray-200 bg-gray-50 animate-pulse flex items-center justify-center text-xs text-gray-400">
          Memuat tombol Google...
        </div>
      )}
    </div>
  );
}
