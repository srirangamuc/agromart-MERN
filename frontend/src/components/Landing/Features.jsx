import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShoppingCart, Truck } from 'lucide-react';

const Features = () => {
  const features = [
    { 
      title: "Extensive Farm Network", 
      description: "Discover a diverse range of sustainable farms offering unique, high-quality produce.",
      icon: Leaf,
      color: "green"
    },
    { 
      title: "Seamless Ordering", 
      description: "Intuitive, user-friendly platform that makes selecting and purchasing farm products effortless.",
      icon: ShoppingCart,
      color: "blue"
    },
    { 
      title: "Swift Delivery", 
      description: "Guaranteed fresh delivery within 1-2 business days, bringing farm-fresh produce directly to you.",
      icon: Truck,
      color: "purple"
    }
  ];

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          Why Choose Our Platform
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={featureVariants}
              whileHover="hover"
              className={`bg-white p-8 rounded-2xl shadow-lg text-center 
                transition-all duration-300 border-t-4 border-${feature.color}-500`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: index * 0.2 
                }}
                className={`inline-flex items-center justify-center 
                  w-20 h-20 rounded-full bg-${feature.color}-100 text-${feature.color}-600 mb-6`}
              >
                <feature.icon size={40} strokeWidth={1.5} />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;