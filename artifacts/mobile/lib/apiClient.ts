import type {
  AuthPayload,
  LoginPayload,
  MePayload,
  RegisterPayload,
} from '@/types/auth';

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ConnectivityResult = {
  ok: boolean;
  url: string;
  status?: number;
  message: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
  category?: 'validation' | 'auth' | 'network' | 'timeout' | 'server' | 'unknown';
  url?: string;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string[]>,
    category: ApiError['category'] = 'unknown',
    url?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.category = category;
    this.url = url;
  }
}

function ensureApiPath(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function resolveApiBaseUrl() {
  return ensureApiPath(
    process.env.EXPO_PUBLIC_API_BASE_URL
      || process.env.VITE_API_BASE_URL
      || ''
  );
}

export const API_BASE_URL = resolveApiBaseUrl();

let authToken: string | null = null;
let didLogApiDebug = false;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new ApiError(
      'API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to your Laravel /api URL.',
      undefined,
      undefined,
      'network'
    );
  }

  return `${API_BASE_URL}/${path.replace(/^\//, '')}`;
}

function logApiDebugOnce() {
  if (didLogApiDebug || process.env.NODE_ENV === 'production') return;
  didLogApiDebug = true;

  console.info('[HealthSync API]', {
    apiBaseUrl: API_BASE_URL || 'missing',
    authEndpoint: API_BASE_URL ? buildUrl('/login') : 'missing',
    dashboardEndpoint: API_BASE_URL ? buildUrl('/dashboard') : 'missing',
  });
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  logApiDebugOnce();
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const requestToken = options.token ?? authToken;
  if (requestToken) {
    headers.Authorization = `Bearer ${requestToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    const networkMessage = API_BASE_URL.includes('trycloudflare.com')
      ? 'Backend tunnel is not reachable. Restart cloudflared and update the API URL if the tunnel link changed.'
      : 'Unable to reach the backend server. Check backend tunnel and API URL.';

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[HealthSync API network error]', {
        url,
        message: error instanceof Error ? error.message : 'Network request failed',
      });
    }

    throw new ApiError(networkMessage, undefined, undefined, 'network', url);
  }

  const data = await parseJson(response);

  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    const validationMessage = body?.errors
      ? Object.values(body.errors).flat().find(Boolean)
      : undefined;

    throw new ApiError(
      validationMessage || body?.message || `Request failed with status ${response.status}.`,
      response.status,
      body?.errors,
      response.status === 401 || response.status === 403
        ? 'auth'
        : body?.errors
          ? 'validation'
          : response.status >= 500
            ? 'server'
            : 'unknown',
      url
    );
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    if (error.category === 'network') {
      return error.message;
    }

    if (error.category === 'auth' || error.status === 401) {
      return error.message || 'Invalid credentials or unauthenticated session.';
    }

    if (error.category === 'validation') {
      return error.message || 'Please check the form and try again.';
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function testBackendConnection(): Promise<ConnectivityResult> {
  logApiDebugOnce();
  const url = buildUrl('/dashboard');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    return {
      ok: response.status === 200 || response.status === 401,
      url,
      status: response.status,
      message: response.status === 200 || response.status === 401
        ? 'Backend is reachable.'
        : `Backend responded with HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      ok: false,
      url,
      message: error instanceof Error ? error.message : 'Network request failed.',
    };
  }
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthPayload>('/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthPayload>('/register', {
    method: 'POST',
    body: payload,
  });
}

export function fetchMe(token?: string | null) {
  return apiRequest<MePayload>('/me', { token });
}

export function logout() {
  return apiRequest<{ message: string }>('/logout', {
    method: 'POST',
  });
}
