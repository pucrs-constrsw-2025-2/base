import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { authService } from '../../services';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const refreshDebugInfo = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    const userData = localStorage.getItem('user_data');
    
    const now = Date.now();
    const expiration = expiresAt ? parseInt(expiresAt) : null;
    const timeLeft = expiration ? Math.max(0, expiration - now) : 0;
    
    setDebugInfo({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken ? refreshToken.substring(0, 30) + '...' : null,
      expiresAt: expiration ? new Date(expiration).toLocaleString() : null,
      timeLeftMs: timeLeft,
      timeLeftMin: Math.floor(timeLeft / 60000),
      isAuthenticated: authService.isAuthenticated(),
      userData: userData ? JSON.parse(userData) : null,
      localStorage: {
        totalItems: Object.keys(localStorage).length,
        authKeys: Object.keys(localStorage).filter(key => 
          key.includes('token') || key.includes('user') || key.includes('auth')
        )
      }
    });
  };

  useEffect(() => {
    refreshDebugInfo();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(refreshDebugInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug - Auth Status</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDebugInfo}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <Badge variant={debugInfo.isAuthenticated ? 'default' : 'secondary'}>
              {debugInfo.isAuthenticated ? 'Autenticado' : 'Não autenticado'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Access Token:</span>
            <Badge variant={debugInfo.hasToken ? 'default' : 'destructive'}>
              {debugInfo.hasToken ? 'Presente' : 'Ausente'}
            </Badge>
          </div>
          
          {debugInfo.tokenPreview && (
            <div>
              <span className="font-mono text-xs break-all">{debugInfo.tokenPreview}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span>Refresh Token:</span>
            <Badge variant={debugInfo.hasRefreshToken ? 'default' : 'destructive'}>
              {debugInfo.hasRefreshToken ? 'Presente' : 'Ausente'}
            </Badge>
          </div>
          
          {debugInfo.expiresAt && (
            <div>
              <span>Expira em:</span>
              <div className="text-xs text-muted-foreground">
                {debugInfo.expiresAt}
              </div>
              <div className="text-xs">
                ({debugInfo.timeLeftMin} min restantes)
              </div>
            </div>
          )}
          
          {debugInfo.userData && (
            <div>
              <span>Usuário:</span>
              <div className="text-xs text-muted-foreground">
                {debugInfo.userData.name} ({debugInfo.userData.role})
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div>LocalStorage: {debugInfo.localStorage?.totalItems} itens</div>
            <div>Keys auth: {debugInfo.localStorage?.authKeys?.join(', ')}</div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                alert('Debug info copiado!');
              }}
              className="text-xs"
            >
              Copiar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                localStorage.clear();
                refreshDebugInfo();
                alert('LocalStorage limpo!');
              }}
              className="text-xs"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}