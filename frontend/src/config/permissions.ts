/**
 * Define os papéis da aplicação para garantir consistência.
 * Exportar este tipo permite que ele seja usado em toda a aplicação
 * sem duplicação.
 */
export type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

/**
 * Define os identificadores únicos para cada funcionalidade (tela/botão).
 * Usar um tipo para isso ajuda a evitar erros de digitação.
 */
export type FeatureId =
  | 'home'
  | 'teachers'
  | 'students'
  | 'buildings'
  | 'subjects'
  | 'classes'
  | 'lessons'
  | 'resources'
  | 'reservations';

/**
 * Mapeamento central de permissões.
 * A estrutura é `Record<UserRole, FeatureId[]>`, que mapeia cada papel
 * a um array das funcionalidades que ele pode acessar.
 *
 * Esta abordagem é limpa, fácil de manter e serve como a "fonte da verdade"
 * para as permissões no frontend.
 */
const permissions: Record<UserRole, FeatureId[]> = {
  Administrador: [
    'home',
    'teachers',
    'students',
    'buildings',
    'subjects',
    'classes',
    'lessons',
    'resources',
    'reservations',
  ],
  Coordenador: [
    'home',
    'teachers',
    'students',
    'classes',
    'lessons',
    'reservations',
  ],
  Professor: [
    'home',
    'lessons',
    'reservations',
  ],
  Aluno: [
    'home',
    'reservations',
  ],
};

/**
 * Função utilitária para verificar se um papel tem permissão para uma funcionalidade.
 * Esta é a única função que outros componentes precisarão para verificar o acesso.
 *
 * @param role O papel do usuário.
 * @param featureId O ID da funcionalidade a ser verificada.
 * @returns `true` se o usuário tiver permissão, `false` caso contrário.
 */
export const hasPermission = (role: UserRole, featureId: FeatureId): boolean => {
  return permissions[role]?.includes(featureId) ?? false;
};