import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Configuração base da API
// Detecta se está no GitHub Codespaces ou local
const isCodespaces = window.location.hostname.includes('app.github.dev');

let API_BASE_URL: string;

if (isCodespaces) {
  // GitHub Codespaces: usa proxy nginx para evitar Mixed Content
  API_BASE_URL = '/api';
} else {
  // Local: usa variável de ambiente ou fallback para localhost
  API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
}

console.log('🔍 Ambiente detectado:', isCodespaces ? 'GitHub Codespaces' : 'Local');
console.log('🔧 ApiClient configurado com URL:', API_BASE_URL);

// Classe para gerenciar o cliente HTTP
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para adicionar token em requisições
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratamento de respostas
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Se token expirou, limpar localStorage e redirecionar para login
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos para gerenciar token
  public setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public clearToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Métodos HTTP
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Método especial para form-data (usado no login)
  public async postFormData<T>(url: string, formData: FormData): Promise<T> {
    console.log('📡 ApiClient.postFormData:', { url, baseURL: this.client.defaults.baseURL });
    
    try {
      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data_keys: Object.keys(response.data as any)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro na requisição:', {
        url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient();