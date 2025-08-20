import { Router, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080/auth';
const realm = process.env.KEYCLOAK_REALM || 'ConstrSW';

// Helper function to get Keycloak token endpoint
const getTokenEndpoint = () => `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`;

// Helper function to get Keycloak users endpoint
const getUsersEndpoint = () => `${keycloakBaseUrl}/admin/realms/${realm}/users`;

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  console.log('Request body:', req.body); // Log para verificar o corpo da requisição

  const { client_id, username, password, grant_type } = req.body;

  try {
    const response = await axios.post(getTokenEndpoint(), null, {
      params: { client_id, username, password, grant_type },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// PATCH /users/:id
router.patch('/users/:id', async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { id } = req.params;

  try {
    await axios.put(`${getUsersEndpoint()}/${id}`, req.body, {
      headers: { Authorization: authorization || '' },
    });

    res.sendStatus(200);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router;