// Utilitário para testar conectividade com o backend

export async function testBackendConnection() {
  const backendUrl = 'http://localhost:8082';
  
  console.log('🔍 Testando conectividade com o backend...');
  
  try {
    // Teste 1: Tentar acessar a raiz da API
    console.log('📡 Teste 1: GET /');
    const response1 = await fetch(`${backendUrl}/`);
    console.log('Resposta root:', {
      status: response1.status,
      statusText: response1.statusText,
      headers: Object.fromEntries(response1.headers.entries())
    });
  } catch (error) {
    console.error('❌ Erro no teste 1:', error);
  }

  try {
    // Teste 2: Tentar acessar endpoint de teste (se existir)
    console.log('📡 Teste 2: GET /test');
    const response2 = await fetch(`${backendUrl}/test`);
    console.log('Resposta /test:', {
      status: response2.status,
      statusText: response2.statusText,
      headers: Object.fromEntries(response2.headers.entries())
    });
  } catch (error) {
    console.error('❌ Erro no teste 2:', error);
  }

  try {
    // Teste 3: Verificar CORS
    console.log('📡 Teste 3: Verificando CORS');
    const response3 = await fetch(`${backendUrl}/login`, {
      method: 'OPTIONS'
    });
    console.log('CORS headers:', {
      status: response3.status,
      'access-control-allow-origin': response3.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response3.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response3.headers.get('access-control-allow-headers')
    });
  } catch (error) {
    console.error('❌ Erro no teste 3:', error);
  }

  // Teste 4: Verificar se Docker containers estão rodando
  console.log('📋 Para verificar se os containers estão rodando, execute:');
  console.log('docker-compose ps');
  console.log('docker-compose logs oauth');
}

// Auto-executar o teste quando o módulo for carregado em desenvolvimento
if (typeof window !== 'undefined') {
  testBackendConnection();
}