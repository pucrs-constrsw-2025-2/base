import axios from 'axios';
import { TokenStorage } from './TokenStorage';

const api = axios.create({
	baseURL: 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para incluir access_token
api.interceptors.request.use((config) => {
	if (config.url && !config.url.endsWith('/login')) {
		const token = TokenStorage.getToken();
		if (token) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`,
			};
		}
	}
	return config;
});

// Interceptor para tentar refresh em caso de 401
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response && error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = TokenStorage.getRefreshToken();
			if (refreshToken) {
				try {
					const refreshResponse = await api.post('/refresh', { refresh_token: refreshToken });
					const { access_token } = refreshResponse.data;
					TokenStorage.setToken(access_token);
					originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
					return api(originalRequest);
				} catch (refreshError) {
					TokenStorage.removeToken();
					TokenStorage.removeRefreshToken();
				}
			}
		}
		return Promise.reject(error);
	}
);

export default api;
