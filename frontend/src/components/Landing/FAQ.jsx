import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { 
      question: "What do I need to apply for the account?", 
      answer: "To apply for an account, you'll need a valid government-issued ID, proof of address, and basic personal information. Our online application process is quick and straightforward." 
    },
    { 
      question: "How does the subscription process work?", 
      answer: "Our subscription process is simple. Choose your plan, provide payment details, and you'll get instant access. You can modify or cancel your subscription at any time through your account dashboard." 
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees. Our pricing is transparent, and you'll see all costs upfront before completing your subscription. We believe in clear, honest pricing."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center mb-8 text-gray-800"
      >
        Frequently Asked Questions
      </motion.h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <motion.button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left bg-white shadow-sm rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-semibold text-gray-800">{faq.question}</span>
              <motion.div
                animate={{ 
                  rotate: activeIndex === index ? 180 : 0 
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown 
                  className="text-gray-500" 
                  size={20} 
                />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 rounded-b-lg text-gray-600">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;