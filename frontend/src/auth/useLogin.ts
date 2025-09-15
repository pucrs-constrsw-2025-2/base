import { useState, useCallback } from 'react';
import { loginRequest, TokenResponse } from '../api/auth';
import { useAuth } from './useAuth';

interface LoginState {
  loading: boolean;
  error: string | null;
}

export function useLogin() {
  const { setTokens } = useAuth();
  const [state, setState] = useState<LoginState>({ loading: false, error: null });

  const login = useCallback(async (username: string, password: string): Promise<TokenResponse> => {
    setState({ loading: true, error: null });
    try {
      const tokens = await loginRequest(username, password);
      setTokens(tokens);
      return tokens;
    } catch (e: any) {
      setState({ loading: false, error: e?.message || 'Erro ao autenticar' });
      throw e;
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [setTokens]);

  return { login, ...state };
}