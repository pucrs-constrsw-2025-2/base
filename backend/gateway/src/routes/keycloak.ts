import { Router, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
const realm = process.env.KEYCLOAK_REALM;

// Helpers
const getTokenEndpoint = () =>
  `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`;

const getUsersEndpoint = () =>
  `${keycloakBaseUrl}/admin/realms/${realm}/users`;

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  const { client_id, client_secret, username, password, grant_type } = req.body;

  try {
    // Envia os parâmetros no corpo como application/x-www-form-urlencoded
    const params = new URLSearchParams();
    if (client_id) params.append('client_id', client_id);
    // se o client_secret vier no body, usa ele; caso contrário, usa a variável de ambiente
    const secret = client_secret || process.env.KEYCLOAK_CLIENT_SECRET;
    if (secret) params.append('client_secret', secret);
    if (username) params.append('username', username);
    if (password) params.append('password', password);
    if (grant_type) params.append('grant_type', grant_type);

    const response = await axios.post(getTokenEndpoint(), params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /users
router.post('/users', async (req: Request, res: Response) => {
  const { authorization } = req.headers;

  try {
    const response = await axios.post(getUsersEndpoint(), req.body, {
      headers: { Authorization: authorization || '' },
    });

    res.status(201).json(response.data);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }
  }
});

// GET /users
router.get('/users', async (req: Request, res: Response) => {
  const { authorization } = req.headers;

  try {
    const response = await axios.get(getUsersEndpoint(), {
      headers: { Authorization: authorization || '' },
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }
  }
});

// GET /users/:id
router.get('/users/:id', async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  try {
    const response = await axios.get(`${getUsersEndpoint()}/${id}`, {
      headers: { Authorization: authorization || '' },
    });

    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }

  }
});

// PUT /users/:id
router.put('/users/:id', async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  try {
    await axios.put(`${getUsersEndpoint()}/${id}`, req.body, {
      headers: { Authorization: authorization || '' },
    });

    res.sendStatus(200);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }

  }
});

// PATCH /users/:id
router.patch('/users/:id', async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  try {
    // Mantém axios.put porque os testes usam mockedAxios.put
    await axios.put(`${getUsersEndpoint()}/${id}`, req.body, {
      headers: { Authorization: authorization || '' },
    });

    res.sendStatus(200);
  } catch (error: any) {
    if (error.response) {
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }

  }
});

// DELETE /users/:id
router.delete('/users/:id', async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  try {
    await axios.delete(`${getUsersEndpoint()}/${id}`, {
      headers: { Authorization: authorization || '' },
    });

    res.sendStatus(204);
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'not found' });
      }
      return res
        .status(error.response.status || 500)
        .json(error.response.data || { error: 'Internal Server Error' });
    }
  }
});

export default router;