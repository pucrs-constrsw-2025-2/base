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

  const handleLogin = (username: string, password: string) => {
    // Simulação de login - determina papel baseado no usuário
    let role: UserRole = 'Aluno'; // padrão
    
    if (username.toLowerCase().includes('admin')) {
      role = 'Administrador';
    } else if (username.toLowerCase().includes('coord')) {
      role = 'Coordenador';
    } else if (username.toLowerCase().includes('prof')) {
      role = 'Professor';
    }

    const user: User = {
      name: username,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };

    setCurrentUser(user);
    setIsLoggedIn(true);
    toast.success(`Bem-vindo, ${user.name}! (${user.role})`);
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