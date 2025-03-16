import { useEffect, useState } from "react";
import { Trash2, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import { cartServices } from "../../services/cartServices";
import { toast } from "react-toastify";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalCartValue, setTotalCartValue] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            setIsLoading(true);
            const data = await cartServices.fetchCart();
            // console.log("Cart Data in Component:", data); // Log the data inside Cart.jsx
            setCartItems(data.cartItems || []); // Ensure state updates properly
            setTotalCartValue(Number(data.totalCartValue) || 0);
        } catch (error) {
            console.error("Error fetching cart data:", error);
            setTotalCartValue(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (itemId, vendorId) => {
        try {
            // console.log(itemId,vendorId);
            await cartServices.deleteFromCart(itemId, vendorId);  // Pass both values
            fetchCartData();  // Refresh cart after deletion
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            const data = await cartServices.checkout(paymentMethod);
    
            if (paymentMethod === 'stripe') {
                window.location.href = data.sessionUrl;
            } else {
                toast.success("Checkout successful!");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-pulse text-gray-500 flex items-center space-x-3">
                    <ShoppingCart className="w-10 h-10" />
                    <span className="text-2xl">Loading your cart...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Cart Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                        <ShoppingCart className="mr-4 text-blue-500" />
                        Your Cart
                    </h1>
                    <div className="text-xl font-semibold text-gray-600">
                        {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Cart Items */}
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <ShoppingCart className="mx-auto w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-2xl">It seems your cart is empty</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {cartItems.map((cartItem) => (
                                <div 
                                    key={cartItem._id} 
                                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-gray-100 p-3 rounded-xl">
                                            <img 
                                                src={`src/assets/images/resized_images/${cartItem.itemName}.png`}
                                                alt={cartItem.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">{cartItem.name}</h3>
                                            <div className="flex space-x-6 text-gray-500">
                                                <p>
                                                    <span className="font-semibold text-lg">Quantity:</span> {cartItem.cartQuantity}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-lg">Vendor:</span> {cartItem.vendorName}
                                                </p>
                                            </div>

                                            
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className="text-xl font-bold text-green-600">
                                            ₹{(cartItem.totalPrice || 0).toFixed(2)}
                                        </span>
                                        <button
                                        onClick={() => {
                                            // console.log("Clicked Delete for Item:", cartItem);
                                            handleDelete(cartItem.itemId, cartItem.vendorId);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Total Price */}
                    {cartItems.length > 0 && (
                        <div className="bg-gray-50 p-6 flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-800 flex items-center">
                                <DollarSign className="mr-2 text-green-500" />
                                Total Price
                            </span>
                            <span className="text-3xl font-bold text-green-600">
                                ₹{(totalCartValue || 0).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Checkout Section */}
                {cartItems.length > 0 && (
                    <div className="mt-8 bg-white shadow-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <CreditCard className="mr-4 text-blue-500" />
                            Checkout
                        </h2>
                        <form onSubmit={handleCheckout}>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                        className="form-radio text-blue-500"
                                    />
                                    <label 
                                        htmlFor="cod" 
                                        className="flex items-center space-x-2 text-gray-700"
                                    >
                                        <span>Cash on Delivery</span>
                                    </label>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="radio"
                                        id="stripe"
                                        name="paymentMethod"
                                        value="stripe"
                                        checked={paymentMethod === "stripe"}
                                        onChange={() => setPaymentMethod("stripe")}
                                        className="form-radio text-blue-500"
                                    />
                                    <label 
                                        htmlFor="stripe" 
                                        className="flex items-center space-x-2 text-gray-700"
                                    >
                                        <span>Stripe Payment</span>
                                    </label>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span>Complete Purchase</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;