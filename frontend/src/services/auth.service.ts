export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  try {
    console.log('🔐 Iniciando login para:', credentials.username);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📡 Resposta recebida - Status:', response.status, response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

    // Ler a resposta como texto primeiro (só podemos ler o body uma vez)
    const responseText = await response.text();
    console.log('📦 Resposta completa (texto):', responseText);
    console.log('📦 Status:', response.status, response.statusText);

      // Verificar se a resposta não está ok
    if (!response.ok) {
      let errorMessage = 'Erro ao fazer login';
      
      if (response.status === 401) {
        errorMessage = 'Credenciais inválidas. Verifique o usuário e a senha.';
      } else if (response.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (response.status === 503) {
        // Service Unavailable - Circuit breaker aberto
        errorMessage = 'Serviço de autenticação temporariamente indisponível. Verifique se o serviço OAuth está rodando e tente novamente em alguns instantes.';
      } else if (response.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      }

      // Tentar obter mensagem de erro do servidor
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          console.log('❌ Resposta de erro (JSON):', errorData);
          
          // Verificar se é erro de circuit breaker
          if (errorData.message && errorData.message.includes('circuit breaker')) {
            errorMessage = 'Serviço de autenticação temporariamente indisponível. O circuit breaker está aberto, indicando que o serviço OAuth pode estar offline ou com problemas. Verifique se todos os serviços estão rodando e tente novamente em alguns instantes.';
          } else if (errorData.message || errorData.detail) {
            errorMessage = errorData.message || errorData.detail;
          }
        } catch {
          // Não é JSON, usar o texto como mensagem se for curto
          if (responseText.length < 200) {
            errorMessage = responseText;
          }
          console.log('❌ Resposta de erro (texto):', responseText);
        }
      }

      throw new Error(errorMessage);
    }

    // Tentar parsear como JSON
    let data: any;
    try {
      if (!responseText) {
        throw new Error('Resposta vazia do servidor');
      }
      
      data = JSON.parse(responseText);
      console.log('✅ Resposta de sucesso (JSON):', data);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('❌ Resposta recebida:', responseText);
      throw new Error('Resposta do servidor não é um JSON válido. Verifique a conexão.');
    }
    
    // Validar se a resposta contém os campos obrigatórios
    if (!data) {
      console.error('❌ Data é null ou undefined');
      throw new Error('Resposta inválida do servidor. Nenhum dado recebido.');
    }

    console.log('🔍 Validando campos da resposta...');
    console.log('  - access_token existe?', !!data.access_token);
    console.log('  - accessToken existe?', !!(data as any).accessToken);
    console.log('  - refresh_token existe?', !!data.refresh_token);
    console.log('  - refreshToken existe?', !!(data as any).refreshToken);
    console.log('  - expires_in existe?', !!data.expires_in);
    console.log('  - expiresIn existe?', !!(data as any).expiresIn);
    console.log('  - token_type existe?', !!data.token_type);
    console.log('  - tokenType existe?', !!(data as any).tokenType);
    console.log('  - Estrutura completa:', Object.keys(data));

    // Verificar se os dados estão encapsulados em um campo 'data'
    let tokenData = data;
    if (data.data && typeof data.data === 'object') {
      console.log('📦 Dados encontrados dentro do campo "data"');
      tokenData = data.data;
    }

    // Verificar se o token está em snake_case ou camelCase
    let accessToken = tokenData.access_token || (tokenData as any).accessToken;
    let refreshToken = tokenData.refresh_token || (tokenData as any).refreshToken;
    let expiresIn = tokenData.expires_in ?? (tokenData as any).expiresIn;
    let tokenType = tokenData.token_type || (tokenData as any).tokenType || 'Bearer';

    if (!accessToken) {
      console.error('❌ access_token não encontrado na resposta');
      console.error('❌ Estrutura completa da resposta:', JSON.stringify(data, null, 2));
      throw new Error('Resposta inválida do servidor. Token de acesso não encontrado. Verifique os logs do console para mais detalhes.');
    }

    // Normalizar para snake_case (formato esperado)
    const normalizedData: TokenResponse = {
      access_token: accessToken,
      refresh_token: refreshToken || '',
      expires_in: expiresIn || 300,
      token_type: tokenType,
    };

    console.log('✅ Dados normalizados:', {
      access_token: normalizedData.access_token ? '***' + normalizedData.access_token.slice(-10) : 'não encontrado',
      refresh_token: normalizedData.refresh_token ? '***' + normalizedData.refresh_token.slice(-10) : 'não encontrado',
      expires_in: normalizedData.expires_in,
      token_type: normalizedData.token_type,
    });

    console.log('✅ Login bem-sucedido!');
    return normalizedData;
  } catch (error) {
    console.error('❌ Erro completo no login:', error);
    
    // Se já é um Error, apenas relançar
    if (error instanceof Error) {
      throw error;
    }
    
    // Se for erro de rede (fetch falhou)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique se o servidor está rodando e acessível.');
    }
    
    throw new Error('Erro desconhecido ao fazer login. Tente novamente.');
  }
}

