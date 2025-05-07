const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authController = require('../controllers/authController');
const User = require('../models/userModel');

jest.mock('../models/userModel');

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
app.post('/api/login', (req, res) => authController.login(req, res));

describe('POST /api/login', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email or password is missing', async () => {
        const res = await request(app).post('/api/login').send({ email: 'test@example.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user not found', async () => {
        User.findOne.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'notfound@example.com', password: 'WrongPass1!' });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 if password is incorrect', async () => {
        User.findOne.mockResolvedValue({
            email: 'test@example.com',
            password: '$2a$10$invalidhash', // this won't match bcrypt.compare
        });

        const bcrypt = require('bcryptjs');
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'WrongPass1!' });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('should login successfully with valid credentials', async () => {
        const mockUser = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            password: '$2a$10$validhash',
            role: 'customer',
        };

        User.findOne.mockResolvedValue(mockUser);

        const bcrypt = require('bcryptjs');
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'john@example.com', password: 'ValidPass1!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe(mockUser.email);
        expect(res.body.token).toBeDefined();
        expect(res.body.message).toBe('Login successful');
    });
});
