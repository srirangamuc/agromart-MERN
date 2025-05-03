const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const Item = require('../models/itemModel');
const Vendor = require('../models/vendorModel');
const Distributor = require('../models/distributorModel');
const session = require('express-session');

// Mock dependencies
jest.mock('../models/userModel');
jest.mock('../models/purchaseModel');
jest.mock('../models/itemModel');
jest.mock('../models/vendorModel');
jest.mock('../models/distributorModel');
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://stripe.com/session' }),
      },
    },
  }));
});
jest.mock('bcrypt');

// Stripe instance mock
const stripeMock = require('stripe')();

let server;
let sessionCookie;

beforeAll(async () => {
  // Ensure Mongoose is connected
  if (mongoose.connection.readyState === 0) {
    throw new Error('Mongoose is not connected. Ensure app.js establishes a connection.');
  }

  // Configure session with in-memory store
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    })
  );

  // Start server
  server = app.listen(0, () => {
    console.log('Test server running on port', server.address().port);
  });

  // Simulate login to get session cookie
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: '$2b$10$examplehashedpassword',
    role: 'customer',
    cart: [],
    address: {
        hno: '123',
        street: 'Main St',
        city: 'City',
        state: 'State',
        country: 'Country',
        zipCode: '12345',
      },
    subscription: 'normal',
    save: jest.fn().mockResolvedValue(true),
  };
  User.findOne.mockResolvedValue(mockUser);
  require('bcrypt').compare.mockResolvedValue(true);

  const loginRes = await request(app)
    .post('/api/login')
    .send({ email: 'test@example.com', password: 'testpassword' });

  sessionCookie = loginRes.headers['set-cookie'];
}, 10000);

afterAll(async () => {
  // Clear collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Close server and ensure all listeners are removed
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Clear mocks and timers
  jest.clearAllMocks();
  jest.useRealTimers();

  // Close Mongoose connection
  await mongoose.connection.close();
}, 10000);

beforeEach(async () => {
  jest.clearAllMocks();
  // Clear only relevant collections to avoid timeout
  await Promise.all([
    mongoose.connection.collections.users?.deleteMany({}),
    mongoose.connection.collections.purchases?.deleteMany({}),
    mongoose.connection.collections.items?.deleteMany({}),
    mongoose.connection.collections.vendors?.deleteMany({}),
    mongoose.connection.collections.distributors?.deleteMany({}),
  ]);
}, 10000); // Increased timeout to 10000ms

describe('CustomerController', () => {
  it('should get customer dashboard successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      cart: [{ item: new mongoose.Types.ObjectId(), quantity: 1 }],
      toObject: jest.fn().mockReturnValue({ _id: 'mockId', cart: [] }),
    };
    const mockItems = [
      { name: 'Apple', pricePerKg: 100, quantity: 10, toObject: jest.fn().mockReturnValue({ name: 'Apple', pricePerKg: 100, quantity: 10 }) },
      { name: 'Apple', pricePerKg: 120, quantity: 5, toObject: jest.fn().mockReturnValue({ name: 'Apple', pricePerKg: 120, quantity: 5 }) },
    ];
    User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUser) });
    Item.find.mockResolvedValue(mockItems);

    const res = await request(app)
      .get('/api/customer/products')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([
      expect.objectContaining({ name: 'Apple', averagePrice: '110.00' }),
    ]);
  }, 5000);

  it('should get vendors by item name successfully', async () => {
    const mockVendors = [
      {
        _id: new mongoose.Types.ObjectId(),
        itemName: 'Apple',
        vendor: { name: 'Vendor1' },
        timestamp: new Date(),
        quantity: 10,
        pricePerKg: 100,
      },
    ];
    Vendor.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockVendors) });

    const res = await request(app)
      .get('/api/customer/vendors/Apple')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({ vendor: 'Vendor1', quantity: 10, pricePerKg: 100 }),
    ]);
  }, 5000);

  it('should add item to cart successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      cart: [],
      save: jest.fn().mockResolvedValue(true),
    };
    const mockItem = { _id: new mongoose.Types.ObjectId(), name: 'Apple' };
    const mockVendor = {
      _id: new mongoose.Types.ObjectId(),
      itemName: 'Apple',
      vendor: new mongoose.Types.ObjectId(),
      quantity: 10,
      pricePerKg: 100,
    };
    User.findById.mockResolvedValue(mockUser);
    Item.findOne.mockResolvedValue(mockItem);
    Vendor.findById.mockResolvedValue(mockVendor);

    const res = await request(app)
      .post('/api/customer/add-to-cart')
      .set('Cookie', sessionCookie)
      .send({ vendorId: mockVendor._id, itemName: 'Apple', quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'Item added to cart successfully' });
  }, 5000);

  it('should delete item from cart successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      cart: [
        {
          item: new mongoose.Types.ObjectId(),
          vendor: new mongoose.Types.ObjectId(),
          quantity: 5,
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .delete(`/api/customer/delete-from-cart/${mockUser.cart[0].item}/${mockUser.cart[0].vendor}`)
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'Item removed from cart successfully' });
  }, 5000);

  it('should get cart successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      cart: [
        {
          item: { _id: new mongoose.Types.ObjectId(), name: 'Apple' },
          vendor: {
            _id: new mongoose.Types.ObjectId(),
            vendor: { name: 'Vendor1' },
            quantity: 10,
          },
          quantity: 5,
          pricePerKg: 100,
        },
      ],
    };
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    const res = await request(app)
      .get('/api/customer/get-cart')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.cartItems).toEqual([
      expect.objectContaining({
        itemName: 'Apple',
        vendorName: 'Vendor1',
        cartQuantity: 5,
        totalPrice: 500,
      }),
    ]);
  }, 5000);

  it('should checkout successfully with COD', async () => {
    const mockItemId = new mongoose.Types.ObjectId();
    const mockVendorId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      cart: [
        {
          item: { _id: mockItemId, name: 'Apple' },
          vendor: { _id: mockVendorId, vendor: { _id: mockVendorId } },
          quantity: 5,
          pricePerKg: 100,
        },
      ],
      address: {
        hno: '123',
        street: 'Main St',
        city: 'City',
        state: 'State',
        country: 'Country',
        zipCode: '12345',
      },
      subscription: 'normal',
      save: jest.fn().mockResolvedValue(true),
    };
    const mockDistributor = {
      user: { _id: new mongoose.Types.ObjectId(), address: { city: 'City' } },
    };
    const mockVendor = {
      _id: mockVendorId,
      vendor: new mongoose.Types.ObjectId(),
      itemName: 'Apple',
      quantity: 10,
      quantitySold: 0,
      profit: 0,
      save: jest.fn().mockResolvedValue(true),
    };
    const mockItem = {
      _id: mockItemId,
      name: 'Apple',
      quantity: 10,
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      }),
    });
    Distributor.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockDistributor]),
    });
    Vendor.find.mockResolvedValue([mockVendor]);
    Item.findById.mockResolvedValue(mockItem);
    Purchase.prototype.save = jest.fn().mockResolvedValue(true);
    User.findByIdAndUpdate.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/customer/checkout')
      .set('Cookie', sessionCookie)
      .send({ paymentMethod: 'cod' });

    console.log('Checkout response:', res.status, res.body); // Debug log
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'Order placed successfully' });
  }, 5000);

  it('should get profile successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'John Doe',
      email: 'john@example.com',
      address: { city: 'City' },
      profilePicture: '/uploads/pic.jpg',
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app)
      .get('/api/customer/profile')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      address: { city: 'City' },
      profilePicture: '/uploads/pic.jpg',
    });
  }, 5000);

  it('should update profile successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'John Doe',
      email: 'john@example.com',
      address: {},
      profilePicture: null,
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/customer/update-profile')
      .set('Cookie', sessionCookie)
      .send({ name: 'Jane Doe', email: 'jane@example.com', city: 'New City' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Profile updated successfully',
      user: expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        address: expect.objectContaining({ city: 'New City' }),
      }),
    });
  }, 5000);

  it('should get purchases successfully', async () => {
    const mockPurchases = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: new mongoose.Types.ObjectId().toString(),
        items: [{ item: new mongoose.Types.ObjectId().toString(), quantity: 5 }],
      },
    ];
    Purchase.find.mockResolvedValue(mockPurchases);

    const res = await request(app)
      .get('/api/customer/purchases')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPurchases);
  }, 5000);

  it('should purchase subscription successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      subscription: 'normal',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(mockUser);
    stripeMock.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe.com/session' });

    const res = await request(app)
      .post('/api/customer/subscribe')
      .set('Cookie', sessionCookie)
      .send({ plan: 'pro' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sessionUrl: 'https://stripe.com/session' });
  }, 5000);

  it('should handle success subscription successfully', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      subscription: 'normal',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .get('/api/customer/success-subscription?plan=pro')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'Subscription updated successfully', subscription: 'pro' });
  }, 5000);

  it('should cancel payment successfully', async () => {
    const res = await request(app)
      .get('/api/customer/cancel')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Payment canceled' });
  }, 5000);

  it('should handle success payment successfully', async () => {
    const res = await request(app)
      .get('/api/customer/success')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Payment successful' });
  }, 5000);

  it('should handle failure payment successfully', async () => {
    const res = await request(app)
      .get('/api/customer/failure')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Payment failed' });
  }, 5000);

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/customer/logout')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: 'Logged out successfully' });
  }, 5000);
});