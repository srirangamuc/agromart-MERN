import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Home, ShoppingCart, CreditCard, User, Package, LogOut } from 'lucide-react';
import { setActiveSection } from '../../redux/sectionSlice';
import { logout } from '../../redux/authSlice';
import Navbar from '../../components/Landing/Navbar';
import Products from '../../components/Customer/Products';
import Cart from '../../components/Customer/Cart';
import Subscription from '../../components/Customer/Subscription';
import UpdateProfile from '../../components/Customer/UpdateProfile';
import PreviousPurchases from '../../components/Customer/Purchases';

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
  };

  const sectionConfig = {
    products: {
      component: <Products />,
      icon: Home,
      label: 'Products',
      activeColor: 'text-emerald-500',
    },
    'cart-checkout': {
      component: <Cart />,
      icon: ShoppingCart,
      label: 'Cart',
      activeColor: 'text-indigo-500',
    },
    subscription: {
      component: <Subscription />,
      icon: CreditCard,
      label: 'Subscription',
      activeColor: 'text-purple-500',
    },
    'update-profile': {
      component: <UpdateProfile />,
      icon: User,
      label: 'Profile',
      activeColor: 'text-sky-500',
    },
    'get-purchases': {
      component: <PreviousPurchases />,
      icon: Package,
      label: 'Purchases',
      activeColor: 'text-teal-500',
    },
  };

  const renderSection = () => {
    const ActiveComponent = sectionConfig[activeSection]?.component || sectionConfig.products.component;
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
        <div className="p-6 animate-fade-in-up">{ActiveComponent}</div>
      </div>
    );
  };

  return (
    <div className=" bg-gradient-to-br from-gray-50 via-white to-gray-100 font-inter text-gray-900">
      {/* Header with Glassmorphic Design */}
        <header className="sticky top-0 z-50 bg-gradient-to-bl from-green-200 to-gray-200 backdrop-blur-md shadow-sm h-[25vh] flex flex-col gap-3 justify-center items-center">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Welcome, {user ? user.name : 'Guest'}
          </h1>
        </div>
        <nav className="mb-8 justify-items-center">
          <div className="bg-white/70 backdrop-blur-md rounded-full p-2 shadow-lg max-w-5xl">
            <div className="flex justify-center items-center space-x-2">
              {Object.entries(sectionConfig).map(([key, { icon: Icon, label, activeColor }]) => (
                <button
                  key={key}
                  onClick={() => handleSectionChange(key)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 
                    ${activeSection === key 
                      ? `${activeColor} bg-white shadow-md` 
                      : 'text-gray-600 hover:bg-gray-100'}
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </header>
      {/* Main Content Container */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Content Area */}
        <main className="transition-all duration-500 ease-in-out">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;