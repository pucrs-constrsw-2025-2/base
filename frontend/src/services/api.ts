import axios from 'axios';

const api = axios.create({
  // Esta linha garante que todas as chamadas usem o prefixo correto
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

export default api;