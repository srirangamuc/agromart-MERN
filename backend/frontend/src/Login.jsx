import React, { useState } from "react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [adminNotification, setAdminNotification] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value) ? "" : "Please enter a valid email address.");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(
      validatePassword(e.target.value) ? "" : "Password must be at least 8 characters with a capital letter and number."
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePassword(password)) return;

    const adminEmailRegex = /^admin\d+@freshmart\.com$/;
    setAdminNotification(adminEmailRegex.test(email));
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-5xl p-8 overflow-hidden min-h-[600px]">
        <div className={`absolute inset-0 flex transition-transform duration-700 ease-in-out ${isSignUp ? "translate-x-0" : "-translate-x-1/2"}`}>
          {/* Sign Up Form */}
          <div className="w-1/2 px-10 py-8 text-center flex flex-col items-center justify-center bg-white">
            <h1 className="text-3xl font-bold text-gray-700 mb-4">Create Account</h1>
            <span className="text-gray-500 mb-4">Use your email for registration</span>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              />
              {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              />
              {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
              <select
                name="role"
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              >
                <option value="" disabled selected>What are you?</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              <button
                type="submit"
                className="bg-green-500 text-white px-8 py-2 rounded font-semibold uppercase transition-transform duration-300 transform hover:scale-105 mt-4"
              >
                Sign Up
              </button>
              {adminNotification && (
                <div className="text-red-500 text-sm mt-2">
                  If you're an admin, please use the appropriate email format (e.g., admin_number@freshmart.com).
                </div>
              )}
            </form>
          </div>

          {/* Sign In Form */}
          <div className="w-1/2 px-10 py-8 text-center flex flex-col items-center justify-center bg-white">
            <h1 className="text-3xl font-bold text-gray-700 mb-4">Sign In</h1>
            <span className="text-gray-500 mb-4">Use your credentials for login</span>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-gray-200 p-2 rounded w-full focus:outline-none"
              />
              <a href="#" className="text-gray-600 text-sm mb-4">Forgot Your Password?</a>
              <button
                type="submit"
                className="bg-blue-500 text-white px-8 py-2 rounded font-semibold uppercase transition-transform duration-300 transform hover:scale-105"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>

        {/* Toggle Panels */}
        <div className="absolute inset-y-0 left-1/2 w-1/2 bg-blue-500 text-white flex flex-col items-center justify-center transition-transform duration-700 transform">
          <div className="w-full text-center p-8">
            {isSignUp ? (
              <>
                <h1 className="text-3xl font-bold mb-4">Already a User?</h1>
                <p className="mb-4">Enter your personal details to login</p>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="bg-transparent border border-white px-8 py-2 rounded font-semibold uppercase transition-transform duration-300 transform hover:scale-105"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">New Here?</h1>
                <p className="mb-4">Register yourself to explore our website for further shopping</p>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="bg-transparent border border-white px-8 py-2 rounded font-semibold uppercase transition-transform duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
