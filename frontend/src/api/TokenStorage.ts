// Serviço para persistir e recuperar tokens no sessionStorage
export const TokenStorage = {
  setToken(token: string) {
    sessionStorage.setItem('access_token', token);
  },
  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  },
  removeToken() {
    sessionStorage.removeItem('access_token');
  },
  setRefreshToken(token: string) {
    sessionStorage.setItem('refresh_token', token);
  },
  getRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token');
  },
  removeRefreshToken() {
    sessionStorage.removeItem('refresh_token');
  }
};
