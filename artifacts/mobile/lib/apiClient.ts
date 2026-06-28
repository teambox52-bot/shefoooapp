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

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '';

let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new ApiError('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to your Laravel /api URL.');
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
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
    response = await fetch(buildUrl(path), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
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
      body?.errors
    );
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
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
