import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { 
  Home, 
  Info, 
  Layers, 
  Menu, 
  X 
} from 'lucide-react';
import logo from '../../assets/Agormart-removebg-preview.png';

const Navbar = ({ onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: "Home", icon: Home },
    { href: "#about", label: "About", icon: Info },
    { href: "#services", label: "Services", icon: Layers }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
  <header className="top-0 right-0 z-50 bg-white/70 backdrop-blur-md pt-2 max-w-7xl fixed left-1/2 transform -translate-x-1/2 rounded-full px-6 py-3 mt-5 shadow-lg shadow-green-400/50">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Agormart Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-green-600 transition-colors flex items-center space-x-2 group"
            >
              <link.icon 
                className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" 
              />
              <span className="font-medium">{link.label}</span>
            </motion.a>
          ))}
        </nav>

        {/* Login Button */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onLoginClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
          >
            Login
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 hover:text-green-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 py-2 px-4 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <link.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">{link.label}</span>
                </a>
              ))}
              <button
                onClick={onLoginClick}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;