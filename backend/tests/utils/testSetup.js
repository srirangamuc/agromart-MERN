const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authController = require('../../controllers/authController');

// Mock dependencies
jest.mock('../../redis_client', () => ({
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue(true),
  quit: jest.fn()
}));

jest.mock('cloudinary', () => ({
  config: jest.fn(),
  v2: {
    config: jest.fn(),
    api: {
      ping: jest.fn().mockResolvedValue({ status: 'ok' }),
    },
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'mockImageId',
        url: 'https://mock.cloudinary.com/mock.jpg',
      }),
    },
  },
}));

const createTestApp = (routerPath, router) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
  app.post('/api/login', (req, res) => authController.login(req, res));
  app.use(routerPath, router);
  return app;
};

module.exports = { createTestApp, request };
