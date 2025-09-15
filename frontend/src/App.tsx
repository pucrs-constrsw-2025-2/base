import { useState } from 'react';
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
import { login as loginApi, parseJwt } from './services/auth';

type Screen = 'home' | 'teachers' | 'students' | 'buildings' | 'subjects' | 'classes' | 'lessons' | 'resources' | 'reservations';

type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const handleLogin = async (username: string, password: string) => {
    try {
      const tokenResponse = await loginApi(username, password);
      const decoded: any = parseJwt(tokenResponse.access_token) || {};
      // Mapear roles a partir de realm_access e resource_access (clientes como 'oauth')
      const realmRoles: string[] = decoded?.realm_access?.roles || [];
      const resourceAccess = decoded?.resource_access || {};
      const clientRoles: string[] = Object.values(resourceAccess)
        .flatMap((r: any) => (r?.roles ? r.roles : []));
      // Normalizar para lower-case
      const allRoles = new Set(
        [...realmRoles, ...clientRoles].map((r: any) => String(r).toLowerCase())
      );

      let role: UserRole = 'Aluno';
      if (allRoles.has('administrator') || allRoles.has('admin') || allRoles.has('adminstrador') || allRoles.has('administração') || allRoles.has('administração')) {
        role = 'Administrador';
      } else if (allRoles.has('coordinator') || allRoles.has('coordenador')) {
        role = 'Coordenador';
      } else if (allRoles.has('professor')) {
        role = 'Professor';
      } else if (allRoles.has('student') || allRoles.has('aluno')) {
        role = 'Aluno';
      }

      const user: User = {
        name: decoded?.preferred_username || username,
        role,
        avatar:
          'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      };

      // Armazenar tokens para futuras chamadas autenticadas
      localStorage.setItem('access_token', tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        localStorage.setItem('refresh_token', tokenResponse.refresh_token);
      }

      setCurrentUser(user);
      setIsLoggedIn(true);
      toast.success(`Bem-vindo, ${user.name}! (${user.role})`);
    } catch (err: any) {
      console.error(err);
      toast.error('Falha no login. Verifique suas credenciais.');
    }
  };

  const handleLogout = () => {
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