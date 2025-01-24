import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Plus, 
  Users, 
  BarChart2, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  PieChart
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import vendorService from '../../services/vendorServices';
import { logout } from '../../redux/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Reusable Bento Card Component
const BentoCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col ${className}`}>
    <div className="flex items-center mb-4">
      <Icon className="mr-3 text-blue-600 w-6 h-6" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const VendorDashboard = () => {
  const [vendorData, setVendorData] = useState(null);
  const [profitData, setProfitData] = useState({ productNames: [], profits: [] });
  const [productForm, setProductForm] = useState({
    name: '',
    quantity: '',
    pricePerKg: ''
  });
  const [error, setError] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null); // Vendor Profile Data
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Toggle View/Edit Profile
  const [profileForm, setProfileForm] = useState({ username: '', email: '' ,password :"", hno: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''});
 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorResponse = await vendorService.getVendorDashboard();
        const vendorProfileResponse = await vendorService.fetchProfile(); 
        let vendorProfile_broad={}// Fetch vendor profile
        const profitResponse = await vendorService.getProfitData();
        
        setVendorData(vendorResponse);
        setVendorProfile(vendorProfileResponse);
        setProfitData(profitResponse);

       
      } catch (err) {
        setError('Failed to fetch data. Please log in again.');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await vendorService.addProduct(productForm);
      const vendorResponse = await vendorService.getVendorDashboard();
      const profitResponse = await vendorService.getProfitData();
      
      setVendorData(vendorResponse);
      setProfitData(profitResponse);
      
      setProductForm({ name: '', quantity: '', pricePerKg: '' });
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    }
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log({ ...profileForm });
    try {
      
      await vendorService.updateProfile(profileForm); // Update vendor profile
      const updatedProfile = await vendorService.fetchProfile(); // Fetch updated profile

      setVendorProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };
 
  // Prepare chart data
  const chartData = {
    labels: profitData.productNames,
    datasets: [
      {
        label: 'Profit per Product',
        data: profitData.profits,
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Render loading or error state
  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!vendorData) return <div className="text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 w-full pt-10 pb-10">
      {/* Header with Logout Button */}
      <div className="w-full mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your product performance</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-md"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 w-full">
        {/* Revenue Overview */}
        <div className="col-span-12 md:col-span-4 grid gap-6">
          <BentoCard title="Total Revenue" icon={DollarSign}>
            <div className="flex-grow flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">₹{vendorData.products.reduce((total, product) => total + product.profit, 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </BentoCard>
        </div>

        {/* Add Product */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
          <div className="flex items-center mb-4">
            <Plus className="mr-3 text-green-600 w-6 h-6" />
            <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
          </div>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <input
                type="number"
                placeholder="Quantity (kg)"
                value={productForm.quantity}
                onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <input
                type="number"
                placeholder="Price per kg"
                step="0.01"
                value={productForm.pricePerKg}
                onChange={(e) => setProductForm({...productForm, pricePerKg: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Add Product
            </button>
          </form>
        </div>

        {/* Products Sold */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
          <div className="flex items-center mb-4">
            <ShoppingBag className="mr-3 text-purple-600 w-6 h-6" />
            <h2 className="text-xl font-semibold text-gray-800">Products Sold</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {vendorData.products.map((product, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg p-4 mb-2 flex justify-between items-center hover:bg-gray-100 transition-colors duration-300"
              >
                <div>
                  <p className="font-semibold text-gray-800">{product.itemName}</p>
                  <p className="text-sm text-gray-500">{product.quantitySold} kg</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{product.profit.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">₹{product.pricePerKg.toFixed(2)}/kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Chart */}
        <div className="col-span-12 md:col-span-6">
          <BentoCard title="Profit Distribution" icon={BarChart2}>
            <Bar data={chartData} options={{ responsive: true }} />
          </BentoCard>
        </div>

                {/* Vendor Profile */}
                <div className="col-span-12 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="mr-3 text-green-600 w-6 h-6" />
            <h2 className="text-xl font-semibold text-gray-800">Vendor Profile</h2>
          </div>
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
              <input
                  type="text"
                  placeholder="Username"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
                {/* Password */}
  <input
    type="password"
    placeholder="Password"
    value={profileForm.password}
    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
    className="w-full p-3 border rounded-lg"
  />

  {/* Email */}
  <input
    type="email"
    placeholder="Email"
    value={profileForm.email}
    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
    className="w-full p-3 border rounded-lg"
  />

  {/* Address */}
  <input
    type="text"
    placeholder="House Number"
    value={profileForm.hno}
    onChange={(e) =>
      setProfileForm({ ...profileForm, hno: e.target.value })}
    
    className="w-full p-3 border rounded-lg"
  />
  <input
    type="text"
    placeholder="Street"
    value={profileForm.street}
    onChange={(e) =>
      setProfileForm({ ...profileForm, street: e.target.value })
    }
    className="w-full p-3 border rounded-lg"
  />
  <input
    type="text"
    placeholder="City"
    value={profileForm.city}
    onChange={(e) =>
      setProfileForm({ ...profileForm, city: e.target.value })
    }
    className="w-full p-3 border rounded-lg"
  />
  <input
    type="text"
    placeholder="State"
    value={profileForm.state}
    onChange={(e) =>
      setProfileForm({ ...profileForm, state: e.target.value })
    }
    className="w-full p-3 border rounded-lg"
  />
  <input
    type="text"
    placeholder="Country"
    value={profileForm.country}
    onChange={(e) =>
      setProfileForm({ ...profileForm, country: e.target.value })
    }
    className="w-full p-3 border rounded-lg"
  />
  <input
    type="text"
    placeholder="Zip Code"
    value={profileForm.zipCode}
    onChange={(e) =>
      setProfileForm({ ...profileForm, zipCode: e.target.value })
    }
    className="w-full p-3 border rounded-lg"
  />
              
              <button
                type="submit"
                className="bg-blue-500 text-white p-3 rounded-lg w-full hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-red-500 hover:text-red-600 w-full mt-2 text-center"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <p className="text-lg font-semibold">Username: {vendorProfile.name}</p>
              <p className="text-lg font-semibold">Email: {vendorProfile.email}</p>

              <p> ADDRESS</p>
              <p>
        House No: {vendorProfile.address.hno || "N/A"} <br />
        Street: {vendorProfile.address.street || "N/A"} <br />
        City: {vendorProfile.address.city || "N/A"} <br />
        State: {vendorProfile.address.state || "N/A"} <br />
        Country: {vendorProfile.address.country || "N/A"} <br />
        Zip Code: {vendorProfile.address.zipCode || "N/A"}
      </p>

              <button
                onClick={() => {
                  setProfileForm({ username: vendorProfile.username, email: vendorProfile.email });
                  setIsEditingProfile(true);
                }}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default VendorDashboard;

