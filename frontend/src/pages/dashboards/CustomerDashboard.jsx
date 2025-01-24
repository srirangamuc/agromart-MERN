import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Home, ShoppingCart, CreditCard, User, Package, LogOut } from 'lucide-react';
import { setActiveSection } from '../../redux/sectionSlice';
import { logout } from '../../redux/authSlice';
import Products from '../../components/Customer/Products';
import Cart from '../../components/Customer/Cart';
import Subscription from '../../components/Customer/Subscription';
import UpdateProfile from '../../components/Customer/UpdateProfile';
import PreviousPurchases from '../../components/Customer/Purchases';
import logo from '../../assets/Agormart-removebg-preview.png';


const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const activeSection = useSelector((state) => state.section.activeSection);
  const user = useSelector((state) => state.auth.user);

  const handleSectionChange = (section) => {
    if (section !== activeSection) {
      dispatch(setActiveSection(section));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setActiveSection('products')
  };

  const sectionConfig = {
    products: {
      component: <Products />,
      icon: Home,
      label: 'Products',
      activeColor: 'text-black',
    },
    'cart-checkout': {
      component: <Cart />,
      icon: ShoppingCart,
      label: 'Cart',
      activeColor: 'text-black',
    },
    subscription: {
      component: <Subscription />,
      icon: CreditCard,
      label: 'Subscription',
      activeColor: 'text-black',
    },
    'update-profile': {
      component: <UpdateProfile />,
      icon: User,
      label: 'Profile',
      activeColor: 'text-black',
    },
    'get-purchases': {
      component: <PreviousPurchases />,
      icon: Package,
      label: 'Purchases',
      activeColor :'text-black'
    },
  };


  return (
    <div className="bg-gradient-to-br from-green-200 via-green-100 to-white min-h-screen w-full">
      {/* Navbar */}
      <nav className="bg-transperant pt-7">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-20 w-auto"
                src= {logo}
                alt="FreshMart"
              />
            </div>

            {/* Greeting */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Welcome back, {user ? user.name : 'Guest'}
              </h1>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {Object.entries(sectionConfig).map(([key, { icon: Icon, label, activeColor }]) => (
                <button
                  key={key}
                  onClick={() => handleSectionChange(key)}
                  className={`
                    flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
                    ${activeSection === key 
                      ? `${activeColor} bg-green-100` 
                      : 'text-green-600 hover:bg-green-50'}
                  `}
                >
                  <Icon className="w-6 h-6" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm font-medium"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
        <div>
          {sectionConfig[activeSection]?.component || sectionConfig.products.component}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;