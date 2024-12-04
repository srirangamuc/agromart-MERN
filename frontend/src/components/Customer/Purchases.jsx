import React, { useEffect, useState } from 'react';
import { Package, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { userService } from '../../services/userServices';

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
            {status}
        </span>
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
                    <div className="px-6 py-8 sm:px-10 bg-white text-white">
                        <div className="flex items-center">
                            <Package className="w-10 h-10 mr-4 text-green-500" />
                            <h1 className="text-3xl font-extrabold text-green-500">Your Purchases</h1>
                        </div>
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
                                                    {purchase.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between mb-1">
                                                            <span>{item.name}</span>
                                                            <span className="text-gray-500">
                                                                {item.quantity} Kg @ ₹{item.pricePerKg}/Kg
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-green-600">
                                                    ₹{purchase.totalAmount.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={purchase.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <Package className="w-16 h-16 text-gray-300 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Purchases Yet</h2>
                            <p className="text-gray-500">You haven't made any purchases. Start shopping!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Purchases;