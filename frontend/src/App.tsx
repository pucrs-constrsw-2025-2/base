// App.tsx
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
import { useAuth } from './contexts/AuthContext';

type Screen = 'home' | 'teachers' | 'students' | 'buildings' | 'subjects' | 'classes' | 'lessons' | 'resources' | 'reservations';

export default function App() {
  const { isLoggedIn, user, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };
  
  const handleLogout = () => {
    logout();
    setCurrentScreen('home');
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

  if (!isLoggedIn || !user) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainLayout
        currentUser={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      >
        {renderCurrentScreen()}
      </MainLayout>
      <Toaster />
    </>
  );
}