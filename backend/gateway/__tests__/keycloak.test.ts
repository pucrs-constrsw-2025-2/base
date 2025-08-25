import request from 'supertest';
import express from 'express';
import router from '../src/routes/keycloak';
import axios from 'axios';
import { afterEach, expect, it, jest } from '@jest/globals';
import { describe } from 'node:test';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.use(router);

describe('Keycloak Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should return token data on success', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'token' } });
      const res = await request(app)
        .post('/login')
        .send({ client_id: 'cid', username: 'user', password: 'pass', grant_type: 'password' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token', 'token');
    });

    it('should handle axios error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'invalid_grant' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .post('/login')
        .send({ client_id: 'cid', username: 'user', password: 'wrong', grant_type: 'password' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'invalid_grant');
    });

    it('should handle generic error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/login')
        .send({ client_id: 'cid', username: 'user', password: 'pass', grant_type: 'password' });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('POST /users', () => {
    it('should create user and return 201', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { id: '123' } });
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer token')
        .send({ username: 'newuser' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', '123');
    });

    it('should handle axios error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'bad request' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .post('/users')
        .set('Authorization', 'Bearer token')
        .send({ username: 'baduser' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'bad request');
    });
  });

  describe('GET /users', () => {
    it('should return users list', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [{ id: '1' }, { id: '2' }] });
      const res = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle axios error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 403, data: { error: 'forbidden' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'forbidden');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { id: '1', username: 'user1' } });
      const res = await request(app)
        .get('/users/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', '1');
    });

    it('should handle axios error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'not found' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .get('/users/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'not found');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user and return 200', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });
      const res = await request(app)
        .put('/users/1')
        .set('Authorization', 'Bearer token')
        .send({ username: 'updated' });
      expect(res.status).toBe(200);
    });

    it('should handle axios error', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'bad request' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .put('/users/1')
        .set('Authorization', 'Bearer token')
        .send({ username: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'bad request');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should patch user and return 200', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });
      const res = await request(app)
        .patch('/users/1')
        .set('Authorization', 'Bearer token')
        .send({ username: 'patched' });
      expect(res.status).toBe(200);
    });

    it('should handle axios error', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'bad request' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .patch('/users/1')
        .set('Authorization', 'Bearer token')
        .send({ username: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'bad request');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user and return 204', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: {} });
      const res = await request(app)
        .delete('/users/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should handle axios error', async () => {
      mockedAxios.delete.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'not found' } },
        isAxiosError: true,
      });
      const res = await request(app)
        .delete('/users/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'not found');
    });
  });
});