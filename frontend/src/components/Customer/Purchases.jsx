/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Package, Calendar, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { userService } from '../../services/userServices';
import { purchasesService } from '../../services/purchasesServices';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const statusIcons = {
        'completed': CheckCircle,
        'pending': AlertCircle,
        'cancelled': XCircle
    };

    const StatusIcon = statusIcons[status.toLowerCase()] || AlertCircle;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const RatingStars = ({ purchaseId, initialRating, deliveryStatus, onRate }) => {
    const [rating, setRating] = useState(initialRating);
    const [isRated, setIsRated] = useState(!!initialRating);
    const isDeliveryCompleted = deliveryStatus === "delivered";

    useEffect(() => {
        setRating(initialRating);
        setIsRated(!!initialRating);
    }, [initialRating]);

    const handleRating = async (newRating) => {
        if (isRated || !isDeliveryCompleted) return;

        try {
            await purchasesService.rateDistributor(purchaseId, newRating);
            setRating(newRating);
            setIsRated(true);
            toast.success("Thanks for rating the distributor!");
            onRate();
        } catch (err) {
            console.error("Error submitting rating:", err);
            toast.error("Failed to submit rating.");
        }
    };

    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-5 h-5 transition-all duration-200 ${rating >= star ? "text-yellow-500" : "text-gray-300"} ${
                        isRated || !isDeliveryCompleted ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
                    }`}
                    onClick={() => !isRated && isDeliveryCompleted && handleRating(star)}
                />
            ))}
        </div>
    );
};


// new Method for vendor ratings

const VendorRatingStars = ({ purchaseId, vendorId, initialRating, purchaseStatus, onRate }) => {
    const [rating, setRating] = useState(initialRating);
    const [isRated, setIsRated] = useState(!!initialRating);
    const isPurchaseCompleted = purchaseStatus === "completed";

    useEffect(() => {
        setRating(initialRating);
        setIsRated(!!initialRating);
    }, [initialRating]);

    const handleRating = async (newRating) => {
        if (isRated || !isPurchaseCompleted) return;

        try {
            await purchasesService.rateVendor(purchaseId, vendorId, newRating);
            setRating(newRating);
            setIsRated(true);
            toast.success("Thanks for rating the vendor!");
            onRate();
        } catch (err) {
            console.error("Error submitting rating:", err);
            toast.error("Failed to submit rating.");
        }
    };

    return (
        <div className="flex items-center space-x-1 mt-2">
            <p className="text-sm font-medium">Rate Vendor:</p>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-xl transition-all duration-200 ${
                        star <= rating ? "text-yellow-500" : "text-gray-300"
                    } ${isRated || !isPurchaseCompleted ? "cursor-not-allowed" : "cursor-pointer hover:scale-125"}`}
                >
                    {star <= rating ? "⭐" : "☆"}
                </span>
            ))}
        </div>
    );
};




const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getPurchases();
            setPurchases(data);
        } catch (err) {
            console.error('Error fetching purchases:', err.message);
            setError('Failed to fetch purchases. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to update rating locally without reloading
    const updatePurchaseRating = (purchaseId, vendorId, newRating, isDistributor) => {
        setPurchases((prevPurchases) =>
            prevPurchases.map((purchase) => {
                if (purchase._id === purchaseId) {
                    if (isDistributor) {
                        return { ...purchase, distributorRating: newRating };
                    } else {
                        return {
                            ...purchase,
                            vendorRatings: purchase.vendorRatings.map((vendorRating) =>
                                vendorRating.vendor.toString() === vendorId.toString()
                                    ? { ...vendorRating, rating: newRating }
                                    : vendorRating
                            ),
                        };
                    }
                }
                return purchase;
            })
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-12 sm:px-16 lg:px-24">
            <div className="max-w-[90rem] mx-auto">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden p-8">
                    <div className="px-6 py-8 sm:px-10 bg-green-600 text-white flex items-center">
                        <Package className="w-10 h-10 mr-4" />
                        <h1 className="text-3xl font-extrabold">Your Purchases</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                        </div>
                    ) : purchases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Purchase Date</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Amount</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Distributor Rating</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor Ratings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {purchases.map((purchase) => (
                                        <tr key={purchase._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="text-sm text-gray-900">
                                                    {purchase.items && purchase.items.length > 0 ? (
                                                        purchase.items.map((item, index) => (
                                                            <div key={index} className="flex justify-between mb-1">
                                                                <span>{item.name}</span>
                                                                <span className="text-gray-500">{item.quantity} Kg</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">No items available</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="text-lg font-semibold text-green-600">₹{purchase.totalAmount.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <StatusBadge status={purchase.status} />
                                            </td>
                                            {/* Distributor Rating */}
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <RatingStars 
                                                    purchaseId={purchase._id} 
                                                    initialRating={purchase.distributorRating} 
                                                    deliveryStatus={purchase.deliveryStatus} 
                                                    onRate={(newRating) => updatePurchaseRating(purchase._id, null, newRating, true)} 
                                                />
                                            </td>
                                            {/* Vendor Ratings */}
                                            <td className="px-6 py-6 whitespace-nowrap">
                                            {purchase.vendorRatings.map((vendorRating, index) => {
                                                const vendorId = vendorRating.vendor?._id || vendorRating.vendor;
                                                const vendorName = vendorRating.vendorName;
                                                if (!vendorId) return null;

                                                const initialRating = vendorRating.rating || 0;

                                                return (
                                                    <div key={index} className="mb-2">
                                                        <span className="block text-sm text-gray-700">Vendor { vendorName}</span>
                                                        <VendorRatingStars
                                                            purchaseId={purchase._id}
                                                            vendorId={vendorId.toString()}
                                                            initialRating={Number(initialRating)}
                                                            purchaseStatus={purchase.status}
                                                            onRate={(newRating) => updatePurchaseRating(purchase._id, vendorId, newRating, false)}
                                                        />
                                                    </div>
                                                    );
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};


export default Purchases;
