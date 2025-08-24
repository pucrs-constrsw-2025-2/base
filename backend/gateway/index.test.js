const request = require('supertest');
const app = require('./index');

describe("Gateway API", () => {
  
  it("should respond to /health with status ok", async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  it("should return 200 on /public", async () => {
    const res = await request(app).get('/public');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Rota pública do gateway");
  });

  it("should return 404 on unknown route", async () => {
    const res = await request(app).get('/rota-invalida');
    expect(res.statusCode).toBe(404);
  });

});
