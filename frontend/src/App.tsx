import { useState, useEffect } from 'react';
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
import { authService } from './services';
import { User } from './types';

type Screen = 'home' | 'teachers' | 'students' | 'buildings' | 'subjects' | 'classes' | 'lessons' | 'resources' | 'reservations';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já existe autenticação ao carregar a aplicação
  useEffect(() => {
    const checkAuthentication = () => {
      if (authService.isAuthenticated()) {
        const user = authService.getStoredUser();
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
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

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

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
        currentUser={currentUser!}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      >
        {renderCurrentScreen()}
      </MainLayout>
      <Toaster />
    </>
  );
}