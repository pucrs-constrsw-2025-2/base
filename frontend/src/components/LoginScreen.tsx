import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { authService } from '../services';
import { User } from '../types';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    console.log('🔄 Iniciando login...', { username });

    try {
      // Fazer login com o backend
      console.log('📡 Fazendo requisição para /login...');
      const authResponse = await authService.login(username, password);
      
      console.log('✅ Login bem-sucedido!', {
        token_type: authResponse.token_type,
        expires_in: authResponse.expires_in,
        token_preview: authResponse.access_token.substring(0, 50) + '...'
      });
      
      // Só obter dados do usuário SE o login foi bem-sucedido
      console.log('👤 Login validado pela API - criando dados do usuário...');
      const user = authService.getCurrentUser(username);
      console.log('👤 Dados do usuário:', user);
      
      // Verificar se token foi salvo
      const savedToken = localStorage.getItem('access_token');
      console.log('💾 Token salvo no localStorage:', savedToken ? 'SIM ✅' : 'NÃO ❌');
      
      // Chamar callback de sucesso
      onLogin(user);
      
      toast.success(`Bem-vindo, ${user.name}! (${user.role})`);
      console.log('🎉 Login finalizado com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      console.error('📋 Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Closed CRAS</CardTitle>
          <CardDescription>
            Sistema de Gestão de Recursos Computacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => alert('Funcionalidade em desenvolvimento')}
              >
                Esqueci a senha
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}