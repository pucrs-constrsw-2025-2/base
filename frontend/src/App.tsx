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
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

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

  const handleLogin = async (username, password) => {
    try {
      // 1. FAZ A CHAMADA PARA SUA API (isso você já tinha)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        username,
        password,
      });

      // 2. EXTRAI O TOKEN DA RESPOSTA DO BACKEND
      const { access_token } = response.data;

      // 3. SALVA O TOKEN NO NAVEGADOR PARA USO FUTURO
      localStorage.setItem('authToken', access_token);

      // 4. DECODIFICA O TOKEN PARA OBTER OS DADOS REAIS DO USUÁRIO
      const decodedToken = jwtDecode(access_token);

      // 5. CRIA O OBJETO DE USUÁRIO COM OS DADOS REAIS
      // A simulação foi removida e substituída por dados do token
      const user = {
        name: decodedToken.name || decodedToken.preferred_username,
        // Exemplo de como pegar o papel (role). Ajuste se necessário.
        role: decodedToken.realm_access?.roles.includes('admin') ? 'Administrador' : 'Professor', 
        avatar: 'URL_DO_SEU_AVATAR_PADRAO'
      };

      // 6. ATUALIZA O ESTADO DA APLICAÇÃO
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
    // LIMPA O TOKEN DO NAVEGADOR AO SAIR
    localStorage.removeItem('authToken'); 
    
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