// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let server;

beforeAll(() => {
  server = app.listen(5000, () => {
    console.log('Test server running on port 5000');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe('Auth Routes', () => {
  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'invalid@example.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should signup a new user if not already exists', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'testpassword',
        role: 'customer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Signup successful');
  });
});

describe('Database Connection', () => {
  it('should connect to MongoDB', () => {
    const dbState = mongoose.connection.readyState;
    expect(dbState).toBe(1); // 1 = connected
  });
});
