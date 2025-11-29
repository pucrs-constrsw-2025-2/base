import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { login, TokenResponse } from '../services/auth.service';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (tokenResponse: TokenResponse, username: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const tokenResponse = await login({ username, password });
      
      // Validar se o token foi retornado corretamente
      if (!tokenResponse || !tokenResponse.access_token) {
        setError('Resposta inválida do servidor. Tente novamente.');
        return;
      }
      
      onLogin(tokenResponse, username);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      console.error('Erro no login:', err);
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
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