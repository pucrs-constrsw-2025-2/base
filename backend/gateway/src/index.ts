import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import publicRouter from './routes/public';
import secureRouter from './routes/secure';
import keycloakRouter from './routes/keycloak';
import cors from 'cors';

const app = express();
const memoryStore = new session.MemoryStore();

// Allow CORS for local dev and docker setup
app.use(cors({
  origin: [
    'http://localhost:5173', // vite dev
    'http://localhost:3000', // alternative dev
    'http://localhost', // dockerized nginx default
  ],
  credentials: true,
}));

app.use(session({
  secret: 'gateway-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());

// Adicionando log para verificar se o middleware está sendo executado
app.use((req, res, next) => {
  console.log('Middleware global executado. Método:', req.method, 'URL:', req.url);
  next();
});

// Middleware global para processar JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', publicRouter);
app.use('/secure', secureRouter(keycloak));
app.use('/keycloak', keycloakRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway rodando na porta ${PORT}`);
});
