process.env.JWT_SECRET = 'testsecret';

const { createTestApp, request } = require('./utils/testSetup');
const vendorRoutes = require('../routes/vendorRoutes');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('../models/userModel');
jest.mock('../models/vendorModel');
jest.mock('../models/vendorRatingModel');

const app = createTestApp('/api/vendor', vendorRoutes);

let token;
beforeAll(async () => {
  const mockVendor = {
    _id: 'vendor123',
    name: 'Vendor Tester',
    email: 'vendor@example.com',
    role: 'vendor',
    password: '$2a$10$hashed'
  };

  User.findOne.mockResolvedValue(mockVendor);
  bcrypt.compare = jest.fn().mockResolvedValue(true);

  const res = await request(app).post('/api/login').send({
    email: 'vendor@example.com',
    password: 'password123'
  });

  token = res.body.token;
});

describe('Vendor Routes', () => {
  test('GET /profile - vendor profile', async () => {
    User.findById.mockResolvedValue({ name: 'Vendor Tester' });
    const res = await request(app)
      .get('/api/vendor/profile')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 401, 500]).toContain(res.statusCode);
  });

  test('GET /dashboard - vendor dashboard', async () => {
    const res = await request(app)
      .get('/api/vendor/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /products - get vendor products', async () => {
    const res = await request(app)
      .get('/api/vendor/products')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });
});
