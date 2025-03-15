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
    const isDeliveryCompleted = deliveryStatus === 'delivered';

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
                    className={`w-5 h-5 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'} ${isRated || !isDeliveryCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
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
    const isPurchaseCompleted = purchaseStatus === 'completed';

    useEffect(() => {
        setRating(initialRating);
        setIsRated(!!initialRating);
    }, [initialRating]);

    const handleRating = async (newRating) => {
        if (isRated || !isPurchaseCompleted) return;

        try {
            await purchasesService.rateVendor(purchaseId, vendorId, newRating); // ✅ No review sent
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
        <div className="vendor-rating">
            <p>Rate the Vendor:</p>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => handleRating(star)}
                    style={{ cursor: isRated || !isPurchaseCompleted ? "not-allowed" : "pointer" }}
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="px-6 py-8 sm:px-10 bg-green-500 text-white flex items-center">
                        <Package className="w-10 h-10 mr-4" />
                        <h1 className="text-3xl font-extrabold">Your Purchases</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : purchases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Distributor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {purchases.map((purchase) => (
                                        <tr key={purchase._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-green-600">₹{purchase.totalAmount.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={purchase.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RatingStars 
                                                    purchaseId={purchase._id} 
                                                    initialRating={purchase.distributorRating} 
                                                    deliveryStatus={purchase.deliveryStatus} 
                                                    onRate={fetchPurchases} 
                                                />
                                                

                                                {purchase.items.map((item, index) => {
                                                    const vendorId = item.vendor?._id || item.vendor;

                                                    // Skip rendering if vendorId is missing
                                                    if (!vendorId) return null;

                                                    // Ensure vendorRatings is an array and get the initial rating for this vendor
                                                    const initialRating = purchase.vendorRatings?.find(vr =>
                                                        vr.vendor?.toString() === vendorId.toString()
                                                    )?.rating || 0;

                                                    return (
                                                        <VendorRatingStars
                                                            key={index}
                                                            purchaseId={purchase._id}
                                                            vendorId={vendorId.toString()}  // Ensure vendorId is always a string
                                                            initialRating={Number(initialRating)} // Ensure it's a number
                                                            purchaseStatus={purchase.status}
                                                            onRate={fetchPurchases}
                                                        />
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
