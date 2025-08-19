import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const configService = app.get(ConfigService);

    // Login as admin to get token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: configService.get('KEYCLOAK_ADMIN_USER'),
        password: configService.get('KEYCLOAK_ADMIN_PASSWORD'),
      });

    adminToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users', () => {
    const newUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('POST /users -> should not create a user without auth', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(401);
    });

    it('POST /users -> should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      userId = response.body.id;
    });

    it('GET /users -> should get all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((user) => user.id === userId)).toBe(true);
        });
    });

    it('GET /users/:id -> should get a single user', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.username).toBe(newUser.username);
        });
    });

    it('PATCH /users/:id -> should update a user', () => {
      const updatedData = { firstName: 'UpdatedFirstName' };
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData)
        .expect(200);
    });

    it('DELETE /users/:id -> should delete a user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
