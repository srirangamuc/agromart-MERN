import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { loginUser, registerUser } from '../services/authServices'; 
import logo from '../assets/Agormart-removebg-preview.png';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  X 
} from 'lucide-react';

const AuthPage = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    loginUser(email, password, dispatch); 
  };

  const handleSignup = () => {
    registerUser(name, email, password, 'customer', dispatch); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Content Container */}
        <div className="px-8 py-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="agromart-logo" 
              className="h-12 object-contain" 
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* Form */}
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={isLogin ? handleLogin : handleSignup}
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 group"
          >
            <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <span
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 font-semibold ml-2 cursor-pointer hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;