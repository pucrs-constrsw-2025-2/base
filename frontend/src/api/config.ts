import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
