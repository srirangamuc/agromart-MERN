import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Info, Layers, Menu, X } from "lucide-react";
import logo from "../../assets/Agormart-removebg-preview.png";

// eslint-disable-next-line react/prop-types
const Navbar = ({ onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: "Home", icon: Home },
    { href: "#about", label: "About", icon: Info },
    { href: "#services", label: "Services", icon: Layers },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="absolute top-5 left-4 right-4 z-50  bg-transperant py-3 rounded-lg md:rounded-xl lg:rounded-2xl">
      <div className="container mx-auto px-4 flex justify-between items-center w-full ">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Agormart Logo" className="h-12 w-auto object-contain" />
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
              <link.icon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              <span className="font-medium">{link.label}</span>
            </motion.a>
          ))}
        </nav>

        {/* Login Button & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onLoginClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
          >
            Login
          </motion.button>

          {/* Mobile Menu Button */}
          <button onClick={toggleMobileMenu} className="md:hidden text-gray-600 hover:text-green-600 rounded-lg">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 w-full bg-white shadow-lg rounded-b-lg"
        >
          <div className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 py-2 px-6 w-full text-center hover:bg-green-50 rounded-lg transition-colors"
              >
                <link.icon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-medium">{link.label}</span>
              </a>
            ))}
            <button
              onClick={onLoginClick}
              className="w-11/12 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
