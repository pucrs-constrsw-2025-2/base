const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'gateway-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());

app.get('/public', (req, res) => {
  res.send('Rota pública do gateway');
});

app.get('/secure', keycloak.protect(), (req, res) => {
  res.send('Rota protegida pelo Keycloak');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway rodando na porta ${PORT}`);
});
