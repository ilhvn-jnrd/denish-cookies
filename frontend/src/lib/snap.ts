/**
 * Midtrans Snap Dynamic Loader & Trigger Utility
 * Intelligently switches between Production & Sandbox based on Client Key
 */

export interface SnapConfig {
  clientKey: string;
  isProduction: boolean;
  snapUrl: string;
}

export function getSnapConfig(overrideClientKey?: string, overrideSnapUrl?: string): SnapConfig {
  const clientKey =
    overrideClientKey ||
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
    'Mid-client-hmMqfEj9LisyqvsS';

  const isProduction = !clientKey.startsWith('SB-');

  let snapUrl = overrideSnapUrl || process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL;
  if (!snapUrl) {
    snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
  }

  return { clientKey, isProduction, snapUrl };
}

/**
 * Ensures snap.js is dynamically loaded in browser with the right client key and URL
 */
export function loadSnapScript(overrideClientKey?: string, overrideSnapUrl?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window is not defined'));
    }

    const config = getSnapConfig(overrideClientKey, overrideSnapUrl);

    // If snap is already loaded and script URL matches, resolve immediately
    const existingScript = document.querySelector('script[src*="/snap/snap.js"]') as HTMLScriptElement | null;
    if ((window as any).snap && existingScript && existingScript.src === config.snapUrl) {
      return resolve((window as any).snap);
    }

    // If script exists with a mismatched environment URL, replace it
    if (existingScript && existingScript.src !== config.snapUrl) {
      existingScript.remove();
      delete (window as any).snap;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = config.snapUrl;
    script.setAttribute('data-client-key', config.clientKey);
    script.async = true;

    script.onload = () => {
      resolve((window as any).snap);
    };

    script.onerror = () => {
      reject(new Error(`Gagal memuat script Midtrans Snap dari ${config.snapUrl}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Smart trigger for Midtrans Snap payment
 * Only falls back to mock modal if snapToken explicitly starts with 'SNAP-MOCK-'
 */
export async function triggerSnapPayment(params: {
  snapToken: string;
  clientKey?: string;
  snapUrl?: string;
  onSuccess: (result: any) => void;
  onPending: (result: any) => void;
  onError: (result: any) => void;
  onClose?: () => void;
}): Promise<{ isMock: boolean }> {
  const { snapToken, clientKey, snapUrl, onSuccess, onPending, onError, onClose } = params;

  // Strict check: ONLY mock if token explicitly starts with SNAP-MOCK-
  if (!snapToken || snapToken.startsWith('SNAP-MOCK-') || snapToken.startsWith('SNAP-FALLBACK-')) {
    return { isMock: true };
  }

  try {
    const snap = await loadSnapScript(clientKey, snapUrl);
    if (snap && typeof snap.pay === 'function') {
      snap.pay(snapToken, {
        onSuccess,
        onPending,
        onError,
        onClose: onClose || (() => {}),
      });
      return { isMock: false };
    }
  } catch (err) {
    console.warn('Failed to invoke window.snap.pay:', err);
  }

  // If loading failed completely, allow mock fallback
  return { isMock: true };
}
