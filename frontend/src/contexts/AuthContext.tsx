// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// Tipos baseados nos schemas do backend e no payload do token JWT
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface User {
  name: string;
  role: string;
  avatar: string; // Manteremos o avatar estático por enquanto
}

interface DecodedToken {
  name: string;
  preferred_username: string;
  realm_access: {
    roles: string[];
  };
  // Adicione outros campos do token que você possa precisar
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Ao carregar a aplicação, verifica se há um token no localStorage
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
      const decodedToken: DecodedToken = jwtDecode(storedToken);
      const userRole = decodedToken.realm_access?.roles.includes('Administrador') ? 'Administrador'
        : decodedToken.realm_access?.roles.includes('Coordenador') ? 'Coordenador'
        : decodedToken.realm_access?.roles.includes('Professor') ? 'Professor'
        : 'Aluno';
        
      setUser({
        name: decodedToken.name || decodedToken.preferred_username,
        role: userRole,
        avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // O backend espera dados no formato x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post<TokenResponse>('/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      const decodedToken: DecodedToken = jwtDecode(access_token);
      
      const userRole = decodedToken.realm_access?.roles.includes('Administrador') ? 'Administrador'
        : decodedToken.realm_access?.roles.includes('Coordenador') ? 'Coordenador'
        : decodedToken.realm_access?.roles.includes('Professor') ? 'Professor'
        : 'Aluno';

      const authenticatedUser: User = {
        name: decodedToken.name || decodedToken.preferred_username,
        role: userRole,
        avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      };

      setAccessToken(access_token);
      localStorage.setItem('accessToken', access_token); // Persiste o token
      setUser(authenticatedUser);

      toast.success(`Bem-vindo, ${authenticatedUser.name}! (${authenticatedUser.role})`);
    } catch (error) {
      console.error('Falha no login:', error);
      toast.error('Falha na autenticação. Verifique seu usuário e senha.');
      throw error; // Propaga o erro para o componente de UI poder reagir
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    toast.info('Você foi desconectado');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}