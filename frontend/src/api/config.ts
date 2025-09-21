import axios from 'axios';

// Use uma variável de ambiente para a URL da API em um projeto real
const API_URL = 'http://localhost:8000'; // URL do seu backend FastAPI

const api = axios.create({
  baseURL: API_URL,
});

// Função para adicionar o token de autenticação nos cabeçalhos
export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
