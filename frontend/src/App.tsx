import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import { toast } from 'sonner@2.0.3';

type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      // A URL usa o proxy configurado no vite.config.ts
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      // TODO: Armazenar o access_token de forma segura (e.g., localStorage ou cookie)
      // const { access_token } = response.data;

      // Simulação de dados do usuário após o login bem-sucedido
      // O ideal é que o backend retorne os dados do usuário ou que haja outro endpoint para buscá-los
      const user: User = {
        name: username, 
        role: 'Professor', // TODO: Decodificar o token para obter o papel real do usuário
        avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      };

      setCurrentUser(user);
      setIsLoggedIn(true);
      toast.success(`Bem-vindo, ${user.name}!`);
      navigate('/home');

    } catch (error) {
      console.error("Falha no login", error);
      toast.error("Falha no login. Verifique suas credenciais.");
    }
  };

  const handleLogout = () => {
    // TODO: Limpar o token de acesso armazenado
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/');
    toast.info('Você foi desconectado');
  };

  const handleNavigation = (screen: string) => {
    navigate(`/${screen}`);
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
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/teachers" element={<TeachersScreen />} />
          <Route path="/students" element={<StudentsScreen />} />
          <Route path="/buildings" element={<BuildingsScreen />} />
          <Route path="/subjects" element={<SubjectsScreen />} />
          <Route path="/classes" element={<ClassesScreen />} />
          <Route path="/lessons" element={<LessonsScreen />} />
          <Route path="/resources" element={<ResourcesScreen />} />
          <Route path="/reservations" element={<ReservationsScreen />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </>
  );
}