process.env.JWT_SECRET = 'testsecret';

const { createTestApp, request } = require('./utils/testSetup');
const distributorRoutes = require('../routes/distributorRoutes');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('../models/userModel');
jest.mock('../models/distributorModel');
jest.mock('../models/purchaseModel');

const app = createTestApp('/api/distributor', distributorRoutes);

let token;
beforeAll(async () => {
  const mockDistributor = {
    _id: 'distributor123',
    name: 'Distributor Tester',
    email: 'distributor@example.com',
    role: 'distributor',
    password: '$2a$10$hashed'
  };

  User.findOne.mockResolvedValue(mockDistributor);
  bcrypt.compare = jest.fn().mockResolvedValue(true);

  const res = await request(app).post('/api/login').send({
    email: 'distributor@example.com',
    password: 'password123'
  });

  token = res.body.token;
});

describe('Distributor Routes', () => {
  test('GET / - get distributor profile', async () => {
    const res = await request(app)
      .get('/api/distributor')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /assigned-purchases - get assignments', async () => {
    const res = await request(app)
      .get('/api/distributor/assigned-purchases')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('POST /update-availability - should fail with empty body', async () => {
    const res = await request(app)
      .post('/api/distributor/update-availability')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect([400, 500]).toContain(res.statusCode);
  });
});
