import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import publicRouter from './routes/public';
import secureRouter from './routes/secure';

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

app.use('/public', publicRouter);
app.use('/secure', secureRouter(keycloak));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway rodando na porta ${PORT}`);
});
