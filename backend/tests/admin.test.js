const AdminController = require('../controllers/adminController');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const VendorRating = require('../models/vendorRatingModel');
const Distributor = require('../models/distributorModel');
const Vendor = require('../models/vendorModel');

// Mock the models
jest.mock('../models/purchaseModel');
jest.mock('../models/userModel');
jest.mock('../models/itemModel');
jest.mock('../models/vendorRatingModel');
jest.mock('../models/distributorModel');
jest.mock('../models/vendorModel');

describe('AdminController', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
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

    describe('getAdminDashboard', () => {
        it('should return dashboard data successfully', async () => {
            // Mock data
            const mockPurchases = [{ _id: '1', user: 'user1' }];
            const mockProPlusCustomers = [{ _id: '2', subscription: 'pro plus' }];
            const mockProCustomers = [{ _id: '3', subscription: 'pro' }];
            const mockNormalCustomers = [{ _id: '4', subscription: 'normal' }];
            const mockVendors = [{ _id: '5', role: 'vendor' }];

            // Mock model methods
            Purchase.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockPurchases)
                })
            });
            User.find
                .mockReturnValueOnce({
                    sort: jest.fn().mockResolvedValue(mockProPlusCustomers)
                })
                .mockReturnValueOnce({
                    sort: jest.fn().mockResolvedValue(mockProCustomers)
                })
                .mockReturnValueOnce({
                    sort: jest.fn().mockResolvedValue(mockNormalCustomers)
                })
                .mockReturnValueOnce({
                    sort: jest.fn().mockResolvedValue(mockVendors)
                });

            await AdminController.getAdminDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith({
                purchases: mockPurchases,
                proPlusCustomers: mockProPlusCustomers,
                proCustomers: mockProCustomers,
                normalCustomers: mockNormalCustomers,
                vendors: mockVendors
            });
            expect(res.status).not.toHaveBeenCalledWith(500);
        });

        it('should handle errors', async () => {
            Purchase.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(new Error('Database error'))
                })
            });

            await AdminController.getAdminDashboard(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching admin dashboard data' });
        });
    });

    describe('getRatingsData', () => {
        it('should return vendor and distributor ratings data', async () => {
            const mockVendors = [
                { averageRating: 4.5 },
                { averageRating: 2.5 }
            ];
            const mockDistributors = [
                { averageRating: 3.5, totalDeliveries: 10 },
                { averageRating: 1.5, totalDeliveries: 5 }
            ];

            VendorRating.find.mockResolvedValue(mockVendors);
            Distributor.find.mockResolvedValue(mockDistributors);

            await AdminController.getRatingsData(req, res);

            expect(res.json).toHaveBeenCalledWith({
                vendorRatings: { '0-1': 0, '1-2': 0, '2-3': 1, '3-4': 0, '4-5': 1 },
                vendorAvg: '3.50',
                deliveryRatings: { '0-1': 0, '1-2': 1, '2-3': 0, '3-4': 1, '4-5': 0 },
                deliveryAvg: '2.50'
            });
        });

        it('should handle errors', async () => {
            VendorRating.find.mockRejectedValue(new Error('Database error'));

            await AdminController.getRatingsData(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });

    describe('getVendorDetails', () => {
        it('should return vendor details, stock, and profit', async () => {
            req.body = { vendorId: '123' };
            const mockVendor = { _id: '123', name: 'Test Vendor', role: 'vendor' };
            const mockRating = { vendor: '123', averageRating: 4, ratingCount: 10 };
            const mockStock = [{ itemName: 'Apple', quantity: 100 }];
            const mockProfit = [{ itemName: 'Apple', quantitySold: 50, pricePerKg: 2 }];

            User.findById.mockResolvedValue(mockVendor);
            VendorRating.findOne.mockResolvedValue(mockRating);
            Vendor.find
                .mockReturnValueOnce({
                    select: jest.fn().mockResolvedValue(mockStock)
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockProfit)
                    })
                });

            await AdminController.getVendorDetails(req, res);

            expect(res.json).toHaveBeenCalledWith({
                vendorDetails: {
                    id: '123',
                    name: 'Test Vendor',
                    rating: 4,
                    numberOfRatings: 10
                },
                vendorStock: mockStock,
                vendorProfit: [{ itemName: 'Apple', quantitySold: 50, pricePerKg: 2, totalProfit: 100 }]
            });
        });

        it('should return 404 if vendor not found', async () => {
            req.body = { vendorId: '123' };
            User.findById.mockResolvedValue(null);

            await AdminController.getVendorDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Vendor not found' });
        });
    });

    describe('getTopItemEachYear', () => {
        it('should return top item for each year', async () => {
            const mockResult = [
                { year: 2023, topItem: 'Apple', totalSold: 100 },
                { year: 2024, topItem: 'Banana', totalSold: 150 }
            ];

            Vendor.aggregate.mockResolvedValue(mockResult);

            await AdminController.getTopItemEachYear(req, res);

            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle errors', async () => {
            Vendor.aggregate.mockRejectedValue(new Error('Aggregation error'));

            await AdminController.getTopItemEachYear(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Aggregation error' });
        });
    });

    describe('getTopVendorEachYear', () => {
        it('should return top vendor for each year', async () => {
            const mockResult = [
                { year: 2023, vendorName: 'Vendor1', totalProfit: 1000 },
                { year: 2024, vendorName: 'Vendor2', totalProfit: 1500 }
            ];

            Vendor.aggregate.mockResolvedValue(mockResult);

            await AdminController.getTopVendorEachYear(req, res);

            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should handle errors', async () => {
            Vendor.aggregate.mockRejectedValue(new Error('Aggregation error'));

            await AdminController.getTopVendorEachYear(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Aggregation error' });
        });
    });

    describe('updatePurchaseStatus', () => {
        it('should update purchase status successfully', async () => {
            req.body = { purchaseId: '123', status: 'shipped' };
            const mockPurchase = { _id: '123', status: 'shipped' };

            Purchase.findByIdAndUpdate.mockResolvedValue(mockPurchase);

            await AdminController.updatePurchaseStatus(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Purchase status updated successfully',
                purchase: mockPurchase
            });
        });

        it('should return 404 if purchase not found', async () => {
            req.body = { purchaseId: '123', status: 'shipped' };
            Purchase.findByIdAndUpdate.mockResolvedValue(null);

            await AdminController.updatePurchaseStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Purchase not found' });
        });
    });
});