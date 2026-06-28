import React from 'react';
import { router, useSegments } from 'expo-router';

import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setApiAuthToken,
} from '@/lib/apiClient';
import type { BackendUser, LoginPayload, RegisterPayload } from '@/types/auth';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from './tokenStorage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: BackendUser | null;
  token: string | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const AUTH_ROUTE_SEGMENTS = new Set([
  undefined,
  'index',
  'login',
  'register',
  'register-profile',
  'forgot-password',
  'reset-password',
  '+not-found',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [user, setUser] = React.useState<BackendUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const segments = useSegments();

  const applyAuthenticatedSession = React.useCallback(async (nextToken: string, nextUser: BackendUser) => {
    setApiAuthToken(nextToken);
    await setStoredAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const clearSession = React.useCallback(async () => {
    setApiAuthToken(null);
    await clearStoredAuthToken();
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const restoreSession = React.useCallback(async () => {
    setStatus('loading');
    const storedToken = await getStoredAuthToken();

    if (!storedToken) {
      await clearSession();
      return;
    }

    setApiAuthToken(storedToken);

    try {
      const response = await fetchMe(storedToken);
      await applyAuthenticatedSession(storedToken, response.user);
    } catch {
      await clearSession();
    }
  }, [applyAuthenticatedSession, clearSession]);

  React.useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  React.useEffect(() => {
    if (status === 'loading') return;

    const firstSegment = segments[0];
    const isAuthRoute = AUTH_ROUTE_SEGMENTS.has(firstSegment);
    const isAuthenticated = status === 'authenticated';

    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [segments, status]);

  const signIn = React.useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      await applyAuthenticatedSession(response.access_token, response.user);
      router.replace('/(tabs)');
    },
    [applyAuthenticatedSession]
  );

  const signUp = React.useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerRequest(payload);
      await applyAuthenticatedSession(response.access_token, response.user);
      router.replace('/(tabs)');
    },
    [applyAuthenticatedSession]
  );

  const signOut = React.useCallback(async () => {
    try {
      if (token) {
        await logoutRequest();
      }
    } catch {
      // Local session cleanup must still happen if the backend is unreachable or already unauthenticated.
    } finally {
      await clearSession();
      router.replace('/login');
    }
  }, [clearSession, token]);

  const value = React.useMemo(
    () => ({
      status,
      user,
      token,
      signIn,
      signUp,
      signOut,
      restoreSession,
    }),
    [restoreSession, signIn, signOut, signUp, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = React.useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
