import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { TokenResponse, loadTokens, saveTokens, clearTokens } from '../api/auth';

export interface AuthState {
  tokens: TokenResponse | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  setTokens: (t: TokenResponse | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokensState] = useState<TokenResponse | null>(() => loadTokens());

  const setTokens = useCallback((t: TokenResponse | null) => {
    if (t) {
      saveTokens(t);
    } else {
      clearTokens();
    }
    setTokensState(t);
  }, []);

  const logout = useCallback(() => setTokens(null), [setTokens]);

  // Sincroniza entre abas
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'auth.tokens') {
        setTokensState(loadTokens());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    tokens,
    isAuthenticated: !!tokens?.access_token,
    setTokens,
    logout,
  }), [tokens, setTokens, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};