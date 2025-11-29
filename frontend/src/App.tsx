import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { Home } from './components/screens/Home';
import { ProfessorsScreen } from './components/screens/ProfessorsScreen';
import { StudentsScreen } from './components/screens/StudentsScreen';
import { RoomsScreen } from './components/screens/RoomsScreen';
import { SubjectsScreen } from './components/screens/SubjectsScreen';
import { ClassesScreen } from './components/screens/ClassesScreen';
import { LessonsScreen } from './components/screens/LessonsScreen';
import { ResourcesScreen } from './components/screens/ResourcesScreen';
import { ReservationsScreen } from './components/screens/ReservationsScreen';
import { EmployeesScreen } from './components/screens/EmployeesScreen';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { TokenResponse } from './services/auth.service';
import { decodeJwt, mapRoleFromJwt } from './utils/jwt';

type Screen = 'home' | 'professors' | 'students' | 'rooms' | 'subjects' | 'classes' | 'lessons' | 'resources' | 'reservations' | 'employees';

type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
  accessToken: string;
  refreshToken: string;
}

const TOKEN_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'current_user';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Verificar se há tokens salvos ao carregar a aplicação
  useEffect(() => {
    const savedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (savedTokens && savedUser) {
      try {
        const tokens: TokenResponse = JSON.parse(savedTokens);
        const user: User = JSON.parse(savedUser);
        
        // Verificar se o token ainda é válido (não expirado)
        const payload = decodeJwt(tokens.access_token);
        if (payload && payload.exp * 1000 > Date.now()) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          // Token expirado, limpar storage
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const handleLogin = (tokenResponse: TokenResponse, username: string) => {
    // Validar se o tokenResponse é válido
    if (!tokenResponse || !tokenResponse.access_token) {
      toast.error('Resposta de autenticação inválida');
      return;
    }

    // Decodificar JWT para obter informações do usuário
    const payload = decodeJwt(tokenResponse.access_token);
    
    if (!payload) {
      toast.error('Erro ao processar token de autenticação. Token inválido.');
      return;
    }

    console.log('🔐 Payload do JWT decodificado:', {
      sub: payload.sub,
      email: payload.email,
      preferred_username: payload.preferred_username,
      realm_access: payload.realm_access,
      resource_access: payload.resource_access,
      exp: payload.exp,
      iat: payload.iat,
    });

    // Validar se o token não está expirado
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      toast.error('Token de autenticação expirado. Faça login novamente.');
      return;
    }

    // Mapear role do JWT
    const role = mapRoleFromJwt(payload);
    
    // Obter nome do usuário do JWT ou usar username
    const name = payload.name || payload.preferred_username || payload.email || username;

    const user: User = {
      name: name,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    };

    // Salvar tokens e usuário no localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenResponse));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    setCurrentUser(user);
    setIsLoggedIn(true);
    toast.success(`Bem-vindo, ${user.name}! (${user.role})`);
  };

  const handleLogout = () => {
    // Limpar tokens e dados do usuário
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen('home');
    toast.info('Você foi desconectado');
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home />;
      case 'professors':
        return <ProfessorsScreen />;
      case 'students':
        return <StudentsScreen />;
      case 'rooms':
        return <RoomsScreen />;
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
      case 'employees':
        return <EmployeesScreen />;
      default:
        return <Home />;
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainLayout
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      >
        {renderCurrentScreen()}
      </MainLayout>
      <Toaster />
    </>
  );
}