import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-[716px] w-full flex flex-col items-center text-center justify-center px-6 pt-32 pb-8">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-white text-[48px] md:text-[72px] leading-[1.1] font-semibold max-w-[900px] mb-8 tracking-tight"
      >
        <div><span style={{ letterSpacing: '-0.025em' }}>Know Exactly Why You're Getting Rejected</span></div>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-[16px] md:text-[18px] font-normal text-white max-w-[640px] leading-relaxed mb-10"
      >
        ResumeAI Pro runs 8 diagnostic engines on your resume — skill gaps, ATS compatibility, impact scoring — and gives you a prioritized action plan.
      </motion.p>
      <motion.button 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onClick={() => navigate('/upload')}
        className="group relative px-10 py-4 bg-white text-black rounded-full font-semibold text-[15px] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cta-glow mb-16"
      >
        Analyze My Resume
        <ArrowRight className="w-5 h-5 text-black" />
      </motion.button>
    </main>
  );
};

export default HeroSection;
