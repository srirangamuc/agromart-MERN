import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import { AnimatePresence } from "framer-motion"; // For modal animations
import { loginSuccess, logout } from "./redux/authSlice"; // Assuming your slice is in redux folder
import Success from './components/Customer/Success'

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false); // State to control modal visibility
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if user data exists in localStorage when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      // If user data exists in localStorage, update the Redux store and authenticate the user
      dispatch(loginSuccess({ user: JSON.parse(storedUser), token: storedToken }));
    } else {
      // If no data, logout (just in case user data is corrupted)
      dispatch(logout());
    }
  }, [dispatch]);

  // Automatically redirect to the appropriate dashboard after login
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const route = getDashboardRoute(user.role);
      navigate(route); // Navigate to the determined route
      setShowAuthModal(false); // Close auth modal after login
    }
  }, [isAuthenticated, user, navigate]);



  // Determine the dashboard route based on the user's role
  const getDashboardRoute = (role) => {
    if (role === "customer") return "/dashboard";
    if (role === "admin") return "/admin-dashboard";
    if (role === "vendor") return "/vendor-dashboard";
    return "/auth";
  };

  // Toggle Auth Modal
  const handleAuthModalToggle = () => {
    setShowAuthModal((prevState) => !prevState);
  };

  return (
    <>
      <Routes>
        {/* Landing Page Route with onLoginClick prop */}
        <Route
          path="/"
          element={<LandingPage onLoginClick={handleAuthModalToggle} />}
        />

        {/* Customer Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && user?.role === "customer" ? (
              <>
                <CustomerDashboard />
              </>              
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Vendor Dashboard Route */}
        <Route
          path="/vendor-dashboard"
          element={
            isAuthenticated && user?.role === "vendor" ? (
              <>
                <VendorDashboard />
              </>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <>
                <AdminDashboard />
              </>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/customer/success"
          element={
            isAuthenticated && user?.role === "customer" ? (
              <>
                <Success/>
              </>
            ):(
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Redirect any unmatched routes to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Render the Auth Modal outside Routes */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <AuthPage onClose={handleAuthModalToggle} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
