import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 w-full z-50 bg-transparent"
    >
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tighter text-white">ResumeAI Pro</div>
        <div className="flex items-center gap-8">
          <a className="text-sm font-medium text-white hover:text-white transition-colors" href="#features">Features</a>
          <a className="text-sm font-medium text-white hover:text-white transition-colors" href="#how-it-works">How It Works</a>
          <a className="text-sm font-medium text-white hover:text-white transition-colors" href="#faq">FAQ</a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
