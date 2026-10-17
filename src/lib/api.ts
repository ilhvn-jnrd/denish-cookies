const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number; raw?: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('denish_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        json?.message ||
        (json?.errors ? Object.values(json.errors).flat().join(', ') : null) ||
        `Request failed with status ${res.status}`;

      return { error: errorMsg, status: res.status, raw: json };
    }

    return { data: json, status: res.status, raw: json };
  } catch (err: any) {
    return {
      error: err.message || 'Gagal terhubung ke server backend. Pastikan Laravel berjalan di http://localhost:8000',
      status: 500,
    };
  }
}

export { API_BASE_URL };
