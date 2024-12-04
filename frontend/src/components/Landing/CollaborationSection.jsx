import React from 'react';
import { motion } from 'framer-motion';
import { Tractor,User,Shield } from 'lucide-react';

const CollaborationSection = () => {
  const benefitsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5
      }
    })
  };

  const benefits = [
    {
      icon: Tractor,
      title: "Expand Your Reach",
      description: "Connect with a wider network of potential buyers and partners."
    },
    {
      icon: User,
      title: "Fair Partnerships",
      description: "Transparent and mutually beneficial collaboration opportunities."
    },
    {
      icon: Shield,
      title: "Verified Ecosystem",
      description: "Join a trusted platform with rigorous quality standards."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Agricultural Journey
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-green-100">
            Become a key player in our sustainable agricultural ecosystem. 
            Collaborate, grow, and make a meaningful impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={benefitsVariants}
              className="bg-white/10 p-6 rounded-xl text-center transition-all hover:bg-white/20"
            >
              <benefit.icon 
                className="mx-auto mb-4 text-green-200" 
                size={48} 
                strokeWidth={1.5} 
              />
              <h3 className="text-xl font-bold mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-green-100">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 10,
            delay: 0.6
          }}
          className="text-center"
        >
          <button className="px-8 py-3 bg-white text-green-700 font-bold rounded-full 
            hover:bg-green-50 transition-all transform hover:scale-105 
            shadow-lg hover:shadow-xl">
            Join Our Network
          </button>
        </motion.div>
      </div>

      {/* Animated Background Elements */}
      <motion.div
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ 
          scale: [0, 1.2, 1],
          rotate: 360,
          opacity: [0.5, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-green-500/20 rounded-full"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0.3 }}
        animate={{ 
          scale: [0, 1.1, 1],
          rotate: -360,
          opacity: [0.3, 0.7]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
        className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500/10 rounded-full"
      />
    </section>
  );
};

export default CollaborationSection;