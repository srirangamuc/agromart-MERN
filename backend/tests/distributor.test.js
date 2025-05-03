const distributorController = require('../controllers/distributorController');
const User = require('../models/userModel');
const Distributor = require('../models/distributorModel');
const Purchase = require('../models/purchaseModel');

// Mock the models
jest.mock('../models/userModel');
jest.mock('../models/distributorModel');
jest.mock('../models/purchaseModel');

describe('DistributorController', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            session: { userId: '123' },
            body: {},
            file: null
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDistributorDetails', () => {
        it('should return distributor details successfully', async () => {
            const mockUser = { _id: '123', name: 'Test Distributor', email: 'test@example.com', role: 'distributor', address: {}, profilePicture: '/uploads/test.jpg' };
            const mockDistributor = { user: mockUser, contactPhone: '1234567890', available: true, totalDeliveries: 10, ratingCount: 5, totalRatings: 20, averageRating: 4.0 };

            Distributor.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDistributor)
            });

            await distributorController.getDistributorDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                name: mockUser.name,
                email: mockUser.email,
                contactPhone: mockDistributor.contactPhone,
                address: mockUser.address,
                available: mockDistributor.available,
                totalDeliveries: mockDistributor.totalDeliveries,
                ratingCount: mockDistributor.ratingCount,
                totalRatings: mockDistributor.totalRatings,
                averageRating: mockDistributor.averageRating,
                profilePicture: mockUser.profilePicture
            });
        });

        it('should return 401 if not authenticated', async () => {
            req.session.userId = null;

            await distributorController.getDistributorDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated.' });
        });

        it('should return 404 if distributor not found', async () => {
            Distributor.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await distributorController.getDistributorDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Distributor details not found.' });
        });
    });

    describe('updateAvailability', () => {
        it('should update availability successfully', async () => {
            req.body = { available: true };
            const mockUser = { _id: '123', role: 'distributor' };
            const mockDistributor = { user: '123', available: false, save: jest.fn().mockResolvedValue(true) };

            User.findById.mockResolvedValue(mockUser);
            Distributor.findOne.mockResolvedValue(mockDistributor);

            await distributorController.updateAvailability(req, res);

            expect(mockDistributor.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Availability updated successfully.' });
        });

        it('should create new distributor if not exists', async () => {
            req.body = { available: true };
            const mockUser = { _id: '123', role: 'distributor' };
            Distributor.findOne.mockResolvedValue(null);
            User.findById.mockResolvedValue(mockUser);
            Distributor.mockImplementation(() => ({
                user: '123',
                available: true,
                save: jest.fn().mockResolvedValue(true)
            }));

            await distributorController.updateAvailability(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Availability updated successfully.' });
        });

        it('should return 404 if user is not a distributor', async () => {
            req.body = { available: true };
            User.findById.mockResolvedValue(null);

            await distributorController.updateAvailability(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Distributor not found or unauthorized.' });
        });
    });

    describe('updateDistributorInfo', () => {
        it('should update distributor info successfully', async () => {
            req.body = { contactPhone: '1234567890', address: { hno: '123', street: 'Main St', city: 'City', state: 'State', country: 'Country', zipCode: '12345' } };
            req.file = { filename: 'test.jpg' };
            const mockUser = { _id: '123', role: 'distributor', address: {}, profilePicture: null, save: jest.fn().mockResolvedValue(true) };
            const mockDistributor = { user: '123', contactPhone: '0987654321', save: jest.fn().mockResolvedValue(true) };

            User.findById.mockResolvedValue(mockUser);
            Distributor.findOne.mockResolvedValue(mockDistributor);

            await distributorController.updateDistributorInfo(req, res);

            expect(mockUser.save).toHaveBeenCalled();
            expect(mockDistributor.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Distributor information updated successfully.',
                contactPhone: mockDistributor.contactPhone,
                address: mockUser.address,
                profilePicture: '/uploads/test.jpg'
            });
        });

        it('should return 401 if not authenticated', async () => {
            req.session.userId = null;

            await distributorController.updateDistributorInfo(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated.' });
        });

        it('should return 404 if distributor not found', async () => {
            req.body = { contactPhone: '1234567890' };
            User.findById.mockResolvedValue(null);

            await distributorController.updateDistributorInfo(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Distributor not found or unauthorized.' });
        });
    });

    describe('getAssignedPurchases', () => {
        it('should return assigned purchases successfully', async () => {
            const mockDistributor = { user: '123' };
            const mockPurchases = [{ _id: 'purchase1', assignedDistributor: '123' }];

            Distributor.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDistributor)
            });
            Purchase.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPurchases)
                })
            });

            await distributorController.getAssignedPurchases(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPurchases);
        });

        it('should return 404 if distributor not found', async () => {
            Distributor.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await distributorController.getAssignedPurchases(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Distributor not found.' });
        });
    });

    describe('updateDeliveryStatus', () => {
        it('should update delivery status successfully', async () => {
            req.body = { purchaseId: 'purchase1', status: 'delivered' };
            const mockPurchase = { _id: 'purchase1', assignedDistributor: '123', deliveryStatus: 'assigned', status: 'processing', save: jest.fn().mockResolvedValue(true) };
            const mockDistributor = { user: '123', totalDeliveries: 10 };

            Purchase.findOne.mockResolvedValue(mockPurchase);
            Distributor.findOneAndUpdate.mockResolvedValue(mockDistributor);

            await distributorController.updateDeliveryStatus(req, res);

            expect(mockPurchase.save).toHaveBeenCalled();
            expect(Distributor.findOneAndUpdate).toHaveBeenCalledWith(
                { user: '123' },
                { $inc: { totalDeliveries: 1 } }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Delivery status updated successfully.' });
        });

        it('should return 400 for invalid status', async () => {
            req.body = { purchaseId: 'purchase1', status: 'invalid' };

            await distributorController.updateDeliveryStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status update.' });
        });

        it('should return 404 if purchase not found', async () => {
            req.body = { purchaseId: 'purchase1', status: 'delivered' };
            Purchase.findOne.mockResolvedValue(null);

            await distributorController.updateDeliveryStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Purchase not found or unauthorized.' });
        });
    });

    describe('rateDistributor', () => {
        it('should rate distributor successfully', async () => {
            req.body = { purchaseId: 'purchase1', rating: 4 };
            const mockPurchase = { 
                _id: 'purchase1', 
                assignedDistributor: { _id: '123' }, 
                distributorRating: null, 
                save: jest.fn().mockResolvedValue(true) 
            };
            const mockDistributor = { 
                user: '123', 
                totalRatings: 10, 
                ratingCount: 2, 
                averageRating: 5.0, 
                save: jest.fn().mockResolvedValue(true) 
            };

            Purchase.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPurchase)
            });
            Distributor.findOne.mockResolvedValue(mockDistributor);

            await distributorController.rateDistributor(req, res);

            expect(mockPurchase.save).toHaveBeenCalled();
            expect(mockDistributor.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Rating submitted successfully.', 
                averageRating: '4.67' 
            });
        });

        it('should update existing rating correctly', async () => {
            req.body = { purchaseId: 'purchase1', rating: 3 };
            const mockPurchase = { 
                _id: 'purchase1', 
                assignedDistributor: { _id: '123' }, 
                distributorRating: 4, 
                save: jest.fn().mockResolvedValue(true) 
            };
            const mockDistributor = { 
                user: '123', 
                totalRatings: 10, 
                ratingCount: 2, 
                averageRating: 5.0, 
                save: jest.fn().mockResolvedValue(true) 
            };

            Purchase.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPurchase)
            });
            Distributor.findOne.mockResolvedValue(mockDistributor);

            await distributorController.rateDistributor(req, res);

            expect(mockDistributor.totalRatings).toBe(9); // 10 - 4 + 3
            expect(mockDistributor.ratingCount).toBe(2);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Rating submitted successfully.', 
                averageRating: '4.50' 
            });
        });

        it('should return 400 for invalid rating', async () => {
            req.body = { purchaseId: 'purchase1', rating: 6 };

            await distributorController.rateDistributor(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Rating must be between 1 and 5' });
        });

        it('should return 404 if purchase not found', async () => {
            req.body = { purchaseId: 'purchase1', rating: 4 };
            Purchase.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await distributorController.rateDistributor(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Purchase not found' });
        });
    });
});