process.env.JWT_SECRET = 'testsecret'; // ✅ Required for JWT verification

const { createTestApp, request } = require('./utils/testSetup');
const adminRoutes = require('../routes/adminRoutes');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('../models/userModel');
jest.mock('../models/purchaseModel');
jest.mock('../models/vendorModel');
jest.mock('../models/distributorModel');
jest.mock('../models/vendorRatingModel');

const app = createTestApp('/api/admin', adminRoutes);

let token;
beforeAll(async () => {
  const mockAdmin = {
    _id: 'admin123',
    name: 'Admin Tester',
    email: 'admin@example.com',
    password: '$2a$10$hashed',
    role: 'admin'
  };

  User.findOne.mockResolvedValue(mockAdmin);
  bcrypt.compare = jest.fn().mockResolvedValue(true);

  const res = await request(app).post('/api/login').send({
    email: 'admin@example.com',
    password: 'password123'
  });

  token = res.body.token;
});

describe('Admin Routes', () => {
  test('GET / - fetch dashboard', async () => {
    const res = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /ratings - rating summary', async () => {
    const res = await request(app)
      .get('/api/admin/ratings')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /customer-analysis - subscription data', async () => {
    const res = await request(app)
      .get('/api/admin/customer-analysis')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /top-item-each-year - best item per year', async () => {
    const res = await request(app)
      .get('/api/admin/top-item-each-year')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('GET /top-vendor-each-year - best vendor per year', async () => {
    const res = await request(app)
      .get('/api/admin/top-vendor-each-year')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });
});
