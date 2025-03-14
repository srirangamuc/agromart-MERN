import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/productServices';
import { cartServices } from '../../services/cartServices';

const ItemVendorTable = ({ itemName, onClose }) => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const data = await productsService.getVendorsByItem(itemName);
                setVendors(data);
                setSelectedVendors(data.map(v => ({ vendor: v.vendor, itemName: itemName, quantity: 0, pricePerKg: v.pricePerKg, vendorId: v.id })));
            } catch (error) {
                console.error('Error loading vendors:', error);
            }
        };

        fetchVendors();
    }, [itemName]);

    const handleQuantityChange = (index, value) => {
        const quantity = Math.max(0, Number(value)); // Ensure non-negative
        setSelectedVendors(prev =>
            prev.map((entry, i) => (i === index ? { ...entry, quantity } : entry))
        );
    };

    const handleFinalAddToCart = async () => {
        try {
            const itemsToAdd = selectedVendors.filter(entry => entry.quantity > 0);
            if (itemsToAdd.length === 0) {
                alert("Please select a quantity before adding to cart.");
                return;
            }

            for (const item of itemsToAdd) {
                await cartServices.addToCart(item.itemName, item.vendorId, item.quantity);
            }

            console.log("Items added to cart, redirecting...");
            window.location.href = '/cart';
        } catch (error) {
            console.error("Error adding items to cart:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-5xl">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                    Select vendors for <span className="text-green-600">{itemName}</span>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md text-center">
                        <thead>
                            <tr className="bg-green-500 text-white text-lg">
                                <th className="border p-4 w-[20%]">Vendor</th>
                                <th className="border p-4 w-[15%]">Date</th>
                                <th className="border p-4 w-[15%]">Time</th>
                                <th className="border p-4 w-[15%]">Available (kg)</th>
                                <th className="border p-4 w-[15%]">Price (per kg)</th>
                                <th className="border p-4 w-[20%]">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((v, index) => {
                                const dateObj = new Date(v.timestamp);
                                const date = dateObj.toLocaleDateString();
                                const time = dateObj.toLocaleTimeString();

                                return (
                                    <tr key={index} className="border text-center hover:bg-gray-100 transition">
                                        <td className="border p-4 font-medium text-gray-800">{v.vendor}</td>
                                        <td className="border p-4 text-gray-600">{date}</td>
                                        <td className="border p-4 text-gray-600">{time}</td>
                                        <td className="border p-4 text-green-600 font-semibold">{v.quantity}</td>
                                        <td className="border p-4 text-gray-800 font-medium">{v.pricePerKg} ₹</td>
                                        <td className="border p-4">
                                            <input
                                                type="number"
                                                className="w-28 p-2 border rounded-md text-center outline-none focus:ring-2 focus:ring-green-400"
                                                min="0"
                                                max={v.quantity}
                                                value={selectedVendors[index].quantity}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Final Add to Cart Button */}
                <div className="mt-8 flex justify-between">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleFinalAddToCart} 
                        className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemVendorTable;
