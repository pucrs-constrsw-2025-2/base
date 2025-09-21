import React, { useState } from 'react';
import { useLogin } from '../auth/useLogin';
import { useAuth } from '../auth/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function LoginScreen() {
  const { login, loading, error } = useLogin();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    try {
      await login(username, password);
      // O redirecionamento será feito pelo App.tsx
    } catch {
      /* erro já setado no hook */
    }
  }

  if (isAuthenticated) {
    return (
      <div style={{ maxWidth: 360, margin: '4rem auto' }}>
        <p>Você já está autenticado.</p>
        <a href="/">Ir para Home</a>
      </div>
    );
  }

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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || !username || !password}>
              {loading ? 'Entrando...' : 'Entrar'}
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

export default LoginScreen;