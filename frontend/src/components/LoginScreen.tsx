// LoginScreen.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true);
      try {
        await login(username, password);
        // O sucesso será tratado pelo AuthContext, que mudará o estado global
      } catch (error) {
        // O erro já é exibido pelo toast no AuthContext
        // Apenas paramos o indicador de carregamento
        setIsLoading(false);
      }
      // Não é mais necessário setar loading como false aqui,
      // pois a aplicação irá renderizar a tela principal em caso de sucesso.
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
              <Label htmlFor="username">Usuário (E-mail)</Label>
              <Input
                id="username"
                type="email" // Alterado para e-mail para melhor semântica
                placeholder="Digite seu e-mail"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
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
                disabled={isLoading}
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