import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Info } from 'lucide-react';
import { addToCart } from '../../redux/productSlice';
import { productsService } from '../../services/productServices';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.fetchProducts();
        if (Array.isArray(data.items)) {
          setProducts(data.items);
        } else {
          throw new Error('Fetched data is not an array');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (itemId) => {
    try {
      const quantity = 1;
      await productsService.addToCart(itemId, quantity);
      dispatch(addToCart(itemId, quantity));
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError(error.message);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-100">
        <div className="animate-pulse text-2xl font-semibold text-gray-600">
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-red-50">
        <div className="text-red-600 text-2xl font-semibold flex items-center space-x-2">
          <Info className="w-8 h-8" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <input 
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
            />
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-16">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product._id}
                className="bg-white w-300 h-300 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={`src/assets/images/resized_images/${product.name}.png`}
                    alt={product.name}
                    className="w-200 h-64 object-cover"
                  />
                  {product.quantity <= 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
                    <span className="text-xl font-bold text-green-600">
                      ₹{(product.pricePerKg)*1.5}/kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {product.quantity} kg available
                    </span>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.quantity <= 0}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300
                        ${product.quantity > 0 
                          ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;