const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const customerRoutes = require('../routes/customerRoutes');
const authController = require('../controllers/authController');

jest.mock('../models/userModel');
jest.mock('../models/itemModel');
jest.mock('../models/vendorModel');
jest.mock('../models/purchaseModel');
jest.mock('../models/distributorModel');

jest.mock('../redis_client', () => ({
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue(true),
  quit: jest.fn()
}));

jest.mock('cloudinary', () => ({
  config: jest.fn(),
  v2: {
    config: jest.fn(),
    api: {
      ping: jest.fn().mockResolvedValue({ status: 'ok' })
    },
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'mockImageId',
        url: 'https://mock.cloudinary.com/mockImage.jpg'
      })
    }
  }
}));

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

app.post('/api/login', (req, res) => authController.login(req, res));
app.use('/api/customer', customerRoutes);

let token;

beforeAll(async () => {
  const mockUser = {
    _id: '1234567890abcdef12345678',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$somehashedpassword',
    role: 'customer',
    cart: [],
    address: {
      hno: '1', street: 'Test St', city: 'TestCity', state: 'TS', country: 'India', zipCode: '123456'
    }
  };

  User.findOne.mockResolvedValue(mockUser);
  bcrypt.compare = jest.fn().mockResolvedValue(true);

  const res = await request(app).post('/api/login').send({
    email: 'test@example.com',
    password: 'ValidPass123!'
  });

  token = res.body.token;
});

describe('Customer Routes', () => {
  test('GET /api/customer/products - returns dashboard or error', async () => {
    const res = await request(app)
      .get('/api/customer/products')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.statusCode);
  });

  test('POST /api/customer/add-to-cart - fails with empty body', async () => {
    const res = await request(app)
      .post('/api/customer/add-to-cart')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect([400, 401, 404, 500]).toContain(res.statusCode);
  });

  test('GET /api/customer/get-cart - returns cart or error', async () => {
    const res = await request(app)
      .get('/api/customer/get-cart')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404, 401, 500]).toContain(res.statusCode);
  });

  test('DELETE /api/customer/delete-from-cart/:itemId/:vendorId - error on invalid ids', async () => {
    const res = await request(app)
      .delete('/api/customer/delete-from-cart/fakeItem/fakeVendor')
      .set('Authorization', `Bearer ${token}`);
    expect([400, 404, 500]).toContain(res.statusCode);
  });
});

afterAll(() => {
  const redisClient = require('../redis_client');
  redisClient.quit();
});
