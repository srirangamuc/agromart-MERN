const VendorController = require('../controllers/vendorController');
const Item = require('../models/itemModel');
const VendorRating = require('../models/vendorRatingModel');
const Vendor = require('../models/vendorModel');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const bcrypt = require('bcryptjs');

// Mock the models
jest.mock('../models/itemModel');
jest.mock('../models/vendorRatingModel');
jest.mock('../models/vendorModel');
jest.mock('../models/userModel');
jest.mock('../models/purchaseModel');
jest.mock('bcrypjst');

describe('VendorController', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            session: { userId: '123' },
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addProduct', () => {
        it('should add a new product successfully', async () => {
            req.body = { name: 'Apple', quantity: '100', pricePerKg: '2.5' };
            const mockItem = { name: 'Apple', quantity: 100, pricePerKg: 2.5, save: jest.fn().mockResolvedValue(true) };
            const mockVendor = { vendor: '123', itemName: 'Apple', quantity: 100, pricePerKg: 2.5, quantitySold: 0, profit: 0, timestamp: expect.any(Date), save: jest.fn().mockResolvedValue(true) };

            Item.findOne.mockResolvedValue(null);
            Item.mockImplementation(() => mockItem);
            Vendor.mockImplementation(() => mockVendor);

            await VendorController.addProduct(req, res);

            expect(mockItem.save).toHaveBeenCalled();
            expect(mockVendor.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product added successfully' });
        });

        it('should update existing item and add to vendor', async () => {
            req.body = { name: 'Apple', quantity: '50', pricePerKg: '3' };
            const mockItem = { name: 'Apple', quantity: 100, pricePerKg: 2, save: jest.fn().mockResolvedValue(true) };
            const mockVendor = { vendor: '123', itemName: 'Apple', quantity: 50, pricePerKg: 3, save: jest.fn().mockResolvedValue(true) };

            Item.findOne.mockResolvedValue(mockItem);
            Vendor.mockImplementation(() => mockVendor);

            await VendorController.addProduct(req, res);

            expect(mockItem.quantity).toBe(150);
            expect(mockItem.pricePerKg).toBe(2.5);
            expect(mockItem.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 for invalid product', async () => {
            req.body = { name: 'Invalid', quantity: '100', pricePerKg: '2.5' };

            await VendorController.addProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product is not allowed. Please select from the list of allowed fruits and vegetables.' });
        });

        it('should return 400 if not authenticated', async () => {
            req.user?.id = null;
            req.body = { name: 'Apple', quantity: '100', pricePerKg: '2.5' };

            await VendorController.addProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required and must be valid numbers. Vendor must be logged in.' });
        });
    });

    describe('getProducts', () => {
        it('should return vendor products successfully', async () => {
            const mockProducts = [{ vendor: '123', itemName: 'Apple', quantity: 100 }];

            Vendor.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockProducts)
            });

            await VendorController.getProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ products: mockProducts });
        });

        it('should return 400 if not authenticated', async () => {
            req.user?.id = null;

            await VendorController.getProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Vendor must be logged in' });
        });
    });

    describe('getVendorDashboard', () => {
        it('should return dashboard data successfully', async () => {
            const mockProducts = [{ vendor: '123', itemName: 'Apple', profit: 100 }];
            const mockProfile = { _id: '123', name: 'Vendor1' };

            Vendor.find.mockResolvedValue(mockProducts);
            User.findById.mockResolvedValue(mockProfile);

            await VendorController.getVendorDashboard(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                products: mockProducts,
                vendorProfile: mockProfile,
                productNames: ['Apple'],
                profits: [100]
            });
        });

        it('should return 400 if not authenticated', async () => {
            req.user?.id = null;

            await VendorController.getVendorDashboard(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Vendor must be logged in' });
        });
    });

    describe('updateProfile', () => {
        it('should update vendor profile successfully', async () => {
            req.body = { username: 'NewName', password: 'newpass', email: 'new@example.com', hno: '123', city: 'City' };
            const mockUser = { _id: '123', name: 'OldName', address: {}, save: jest.fn().mockResolvedValue(true) };

            User.findById.mockResolvedValue(mockUser);
            bcryptjs.hash.mockResolvedValue('hashedPassword');

            await VendorController.updateProfile(req, res);

            expect(mockUser.name).toBe('NewName');
            expect(mockUser.email).toBe('new@example.com');
            expect(mockUser.address.hno).toBe('123');
            expect(mockUser.address.city).toBe('City');
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
        });

        it('should return 401 if not authenticated', async () => {
            req.user?.id = null;

            await VendorController.updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            await VendorController.updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('getProfile', () => {
        it('should return vendor profile successfully', async () => {
            const mockUser = { _id: '123', name: 'Vendor1', email: 'vendor@example.com', address: { city: 'City' } };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await VendorController.getProfile(req, res);

            expect(res.json).toHaveBeenCalledWith({
                name: mockUser.name,
                email: mockUser.email,
                address: mockUser.address
            });
        });

        it('should return 401 if not authenticated', async () => {
            req.user?.id = null;

            await VendorController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await VendorController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('rateVendor', () => {
        it('should rate vendor successfully', async () => {
            req.body = { purchaseId: 'purchase1', vendorId: 'vendor1', rating: 4 };
            const mockPurchase = { 
                _id: 'purchase1', 
                status: 'completed', 
                vendorRatings: [], 
                save: jest.fn().mockResolvedValue(true) 
            };
            const mockVendorRating = { 
                vendor: 'vendor1', 
                ratingCount: 1, 
                totalRatings: 3, 
                averageRating: 3, 
                save: jest.fn().mockResolvedValue(true) 
            };

            Purchase.findById.mockResolvedValue(mockPurchase);
            VendorRating.findOne.mockResolvedValue(null);
            VendorRating.mockImplementation(() => mockVendorRating);

            await VendorController.rateVendor(req, res);

            expect(mockPurchase.save).toHaveBeenCalled();
            expect(mockVendorRating.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Vendor rating submitted successfully.', 
                averageRating: 4 
            });
        });

        it('should update existing rating', async () => {
            req.body = { purchaseId: 'purchase1', vendorId: 'vendor1', rating: 5 };
            const mockPurchase = { 
                _id: 'purchase1', 
                status: 'completed', 
                vendorRatings: [{ vendor: 'vendor1', rating: 3 }], 
                save: jest.fn().mockResolvedValue(true) 
            };
            const mockVendorRating = { 
                vendor: 'vendor1', 
                ratingCount: 2, 
                totalRatings: 7, 
                averageRating: 3.5, 
                save: jest.fn().mockResolvedValue(true) 
            };

            Purchase.findById.mockResolvedValue(mockPurchase);
            VendorRating.findOne.mockResolvedValue(mockVendorRating);

            await VendorController.rateVendor(req, res);

            expect(mockPurchase.vendorRatings[0].rating).toBe(5);
            expect(mockVendorRating.totalRatings).toBe(12);
            expect(mockVendorRating.ratingCount).toBe(3);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Vendor rating submitted successfully.', 
                averageRating: '4.00' 
            });
        });

        it('should return 400 for invalid rating', async () => {
            req.body = { purchaseId: 'purchase1', vendorId: 'vendor1', rating: 6 };

            await VendorController.rateVendor(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Rating must be between 1 and 5' });
        });

        it('should return 400 if purchase not completed', async () => {
            req.body = { purchaseId: 'purchase1', vendorId: 'vendor1', rating: 4 };
            const mockPurchase = { _id: 'purchase1', status: 'processing', vendorRatings: [] };

            Purchase.findById.mockResolvedValue(mockPurchase);

            await VendorController.rateVendor(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'You can rate only after purchase is completed' });
        });
    });

    describe('getVendorRating', () => {
        it('should return vendor rating successfully', async () => {
            const mockVendorRating = { vendor: '123', averageRating: 4.5, ratingCount: 10 };

            VendorRating.findOne.mockResolvedValue(mockVendorRating);

            await VendorController.getVendorRating(req, res);

            expect(res.json).toHaveBeenCalledWith({ 
                averageRating: mockVendorRating.averageRating, 
                ratingCount: mockVendorRating.ratingCount 
            });
        });

        it('should return default values if no rating exists', async () => {
            VendorRating.findOne.mockResolvedValue(null);

            await VendorController.getVendorRating(req, res);

            expect(res.json).toHaveBeenCalledWith({ averageRating: 0, ratingCount: 0 });
        });

        it('should handle errors', async () => {
            VendorRating.findOne.mockRejectedValue(new Error('Database error'));

            await VendorController.getVendorRating(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.' });
        });
    });
});