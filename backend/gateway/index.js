const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

/*
* Adicionado acess token ao projeto 
* A chave esta no backend\gateway\.env
*/
const axios = require('axios');

const token = process.env.ACCESS_TOKEN;

axios.get(process.env.KEYCLOAK_BASE_URL, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));

/*
* FIM do acess token
*/

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


