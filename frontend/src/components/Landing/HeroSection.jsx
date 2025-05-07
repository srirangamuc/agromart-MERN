// eslint-disable-next-line no-unused-vars
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, Leaf, CheckCircle } from 'lucide-react';
import heroImage from '../../assets/hero-image.png';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-tl from-green-100 to-gray-200 min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:px-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-64 md:w-96 h-64 md:h-96 bg-green-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-48 md:w-72 h-48 md:h-72 bg-green-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center md:text-left space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 leading-tight">
              Fresh Nandish, 
              <br className="hidden md:block" />
              Straight from Farm
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-md md:max-w-xl mx-auto md:mx-0">
              Discover the freshest produce, handpicked from local farms and delivered directly to your doorstep with care and commitment.
            </p>
          </div>

          {/* CTA and Features */}
          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Start Shopping</span>
            </motion.button>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-700">
              {[{ icon: Truck, text: "Free Delivery" },
                { icon: Leaf, text: "Organic Produce" },
                { icon: CheckCircle, text: "Quality Guaranteed" }
              ].map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-green-600" />
                  <span className="text-sm md:text-base">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center items-center mt-8 md:mt-0 w-full"
        >
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square">
            <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img 
                src={heroImage} 
                alt="Fresh Produce" 
                className="w-full h-full object-contain rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 120 }}
            className="absolute bottom-0 -right-4 md:bottom-10 md:-right-10 bg-white p-3 md:p-4 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <div className="bg-green-100 p-2 rounded-full">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-900 text-sm md:text-base">100% Organic</p>
              <p className="text-xs text-gray-500">Certified Farms</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
