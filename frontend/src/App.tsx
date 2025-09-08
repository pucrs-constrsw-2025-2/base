import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import api from "./api/client";
import { TokenStorage } from "./api/TokenStorage";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./components/screens/Home";
import { TeachersScreen } from "./components/screens/TeachersScreen";
import { StudentsScreen } from "./components/screens/StudentsScreen";
import { BuildingsScreen } from "./components/screens/BuildingsScreen";
import { SubjectsScreen } from "./components/screens/SubjectsScreen";
import { ClassesScreen } from "./components/screens/ClassesScreen";
import { LessonsScreen } from "./components/screens/LessonsScreen";
import { ResourcesScreen } from "./components/screens/ResourcesScreen";
import { ReservationsScreen } from "./components/screens/ReservationsScreen";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

type Screen =
  | "home"
  | "teachers"
  | "students"
  | "buildings"
  | "subjects"
  | "classes"
  | "lessons"
  | "resources"
  | "reservations";

type UserRole = "Administrador" | "Coordenador" | "Professor" | "Aluno";

interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.post("/login", { username, password });
      const { access_token, refresh_token } = response.data;
      TokenStorage.setToken(access_token);
      TokenStorage.setRefreshToken(refresh_token);
      toast.success("Login realizado com sucesso!");
      const user: User = {
        name: username,
        role: "Aluno",
        avatar:
          "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      };
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (error: any) {
      toast.error("Erro ao realizar login. Verifique suas credenciais.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen("home");
    TokenStorage.removeToken();
    TokenStorage.removeRefreshToken();
    toast.info("Você foi desconectado");
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "teachers":
        return <TeachersScreen />;
      case "students":
        return <StudentsScreen />;
      case "buildings":
        return <BuildingsScreen />;
      case "subjects":
        return <SubjectsScreen />;
      case "classes":
        return <ClassesScreen />;
      case "lessons":
        return <LessonsScreen />;
      case "resources":
        return <ResourcesScreen />;
      case "reservations":
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
