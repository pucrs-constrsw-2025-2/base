export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  exp: number;
  iat: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

export function mapRoleFromJwt(payload: JwtPayload): 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno' {
  const roles = payload.realm_access?.roles || [];
  const resourceRoles = Object.values(payload.resource_access || {})
    .flatMap((access) => access.roles || []);

  const allRoles = [...roles, ...resourceRoles].map((r) => r.toLowerCase());

  console.log('🔍 Mapeando roles do JWT:');
  console.log('  - Realm roles:', payload.realm_access?.roles || []);
  console.log('  - Resource roles:', payload.resource_access || {});
  console.log('  - Todas as roles (lowercase):', allRoles);

  if (allRoles.some((r) => r.includes('admin') || r.includes('administrador'))) {
    console.log('  ✅ Role mapeada: Administrador');
    return 'Administrador';
  }
  if (allRoles.some((r) => r.includes('coord') || r.includes('coordenador'))) {
    console.log('  ✅ Role mapeada: Coordenador');
    return 'Coordenador';
  }
  if (allRoles.some((r) => r.includes('prof') || r.includes('professor'))) {
    console.log('  ✅ Role mapeada: Professor');
    return 'Professor';
  }
  
  console.log('  ✅ Role mapeada: Aluno (padrão)');
  return 'Aluno';
}

export function getAllRolesFromJwt(payload: JwtPayload): string[] {
  const roles = payload.realm_access?.roles || [];
  const resourceRoles = Object.values(payload.resource_access || {})
    .flatMap((access) => access.roles || []);
  
  return [...roles, ...resourceRoles];
}

