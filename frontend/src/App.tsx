// App.tsx
import { useState, useEffect, useMemo } from 'react';

import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { Home } from './components/screens/Home';
import { TeachersScreen } from './components/screens/TeachersScreen';
import { StudentsScreen } from './components/screens/StudentsScreen';
import { BuildingsScreen } from './components/screens/BuildingsScreen';
import { SubjectsScreen } from './components/screens/SubjectsScreen';
import { ClassesScreen } from './components/screens/ClassesScreen';
import { LessonsScreen } from './components/screens/LessonsScreen';
import { ResourcesScreen } from './components/screens/ResourcesScreen';
import { ReservationsScreen } from './components/screens/ReservationsScreen';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { login, type LoginCredentials, type TokenResponse } from './api/auth';
import { setAuthHeader } from './api/config';

type Screen =
  | 'home'
  | 'teachers'
  | 'students'
  | 'buildings'
  | 'subjects'
  | 'classes'
  | 'lessons'
  | 'resources'
  | 'reservations';

type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresAt: number | null; // epoch ms
  refreshExpiresAt: number | null; // epoch ms
  isAuthenticated: boolean;
};

const AUTH_STORAGE_KEY = 'auth_tokens_v1';

function safeDecodeJwt(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded && typeof decoded === 'object' ? decoded : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [auth, setAuth] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresAt: null,
    refreshExpiresAt: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = auth.isAuthenticated;

  // Restore tokens on first load (so refreshes keep you logged in)
  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved: AuthState = JSON.parse(raw);
      if (saved?.accessToken && saved?.expiresAt && Date.now() < saved.expiresAt) {
        // Re-attach token to Axios
        setAuthHeader(saved.accessToken);
        setAuth({ ...saved, isAuthenticated: true });
      } else {
        // expired/invalid: nuke it
        setAuthHeader(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      setAuthHeader(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // When authenticated, attempt to build a User object from the JWT
  useEffect(() => {
    if (!auth.accessToken) {
      setCurrentUser(null);
      return;
    }
    const claims = safeDecodeJwt(auth.accessToken) || {};
    // Adapt these keys to your backend claims!
    const name =
      claims.name ||
      claims.preferred_username ||
      claims.username ||
      'Usuário';
    const roleClaim = (claims.role || claims.roles?.[0] || 'Professor') as UserRole;
    setCurrentUser({
      name,
      role: roleClaim,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });
  }, [auth.accessToken]);

  // Auto-logout when token expires (simple version)
  useEffect(() => {
    if (!auth.expiresAt) return;
    const ms = Math.max(0, auth.expiresAt - Date.now());
    const id = setTimeout(() => {
      toast.warning('Sessão expirada. Faça login novamente.');
      handleLogout();
    }, ms);
    return () => clearTimeout(id);
  }, [auth.expiresAt]);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const creds: LoginCredentials = { username, password };
      const res: TokenResponse = await login(creds);

      const expiresAt = Date.now() + res.expires_in * 1000;
      const refreshExpiresAt = Date.now() + res.refresh_expires_in * 1000;

      // Set Axios header immediately
      setAuthHeader(res.access_token);

      const nextAuth: AuthState = {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        tokenType: res.token_type,
        expiresAt,
        refreshExpiresAt,
        isAuthenticated: true,
      };

      setAuth(nextAuth);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));

      toast.success('Login realizado com sucesso!');
      // Optional: redirect to a default screen after login
      setCurrentScreen('home');
    } catch (e) {
      console.error(e);
      setAuthHeader(null);
      setError('Invalid username or password.');
      toast.error('Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthHeader(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      expiresAt: null,
      refreshExpiresAt: null,
      isAuthenticated: false,
    });
    setCurrentUser(null);
    setCurrentScreen('home');
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const screenEl = useMemo(() => {
    switch (currentScreen) {
      case 'home':
        return <Home />;
      case 'teachers':
        return <TeachersScreen />;
      case 'students':
        return <StudentsScreen />;
      case 'buildings':
        return <BuildingsScreen />;
      case 'subjects':
        return <SubjectsScreen />;
      case 'classes':
        return <ClassesScreen />;
      case 'lessons':
        return <LessonsScreen />;
      case 'resources':
        return <ResourcesScreen />;
      case 'reservations':
        return <ReservationsScreen />;
      default:
        return <Home />;
    }
  }, [currentScreen]);

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} loading={loading} error={error ?? undefined} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <MainLayout currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigation}>
        {screenEl}
      </MainLayout>
      <Toaster richColors position="top-right" />
    </>
  );
}