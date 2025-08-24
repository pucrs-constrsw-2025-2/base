const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const axios = require('axios');

const app = express();
const memoryStore = new session.MemoryStore();

/*
 * Adicionado access token ao projeto
 * A chave está no backend\gateway\.env
 */
const token = process.env.ACCESS_TOKEN;

axios.get(process.env.KEYCLOAK_BASE_URL, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));

/*
 * FIM do access token
 */

app.use(session({
  secret: 'gateway-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());

// rota de saúde para testes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/public', (req, res) => {
  res.send('Rota pública do gateway');
});

app.get('/secure', keycloak.protect(), (req, res) => {
  res.send('Rota protegida pelo Keycloak');
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Gateway rodando na porta ${PORT}`);
  });
}

module.exports = app; // 🔑 exporta para os testes
