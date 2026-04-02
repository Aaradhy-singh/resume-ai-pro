import React from 'react';
import { motion } from 'framer-motion';

const SocialProofSection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full bg-black/40 backdrop-blur-md border-y border-white/5 pb-24 pt-12"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col items-center">
          <p className="text-[12px] font-bold tracking-[0.2em] text-white uppercase mb-10">
            TRUSTED BY JOB SEEKERS TARGETING
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-20 text-xl font-bold tracking-tight">
            <span className="text-white">Google</span>
            <span className="text-white">Amazon</span>
            <span className="text-white">Meta</span>
            <span className="text-white">Microsoft</span>
            <span className="text-white">OpenAI</span>
            <span className="text-white">IBM</span>
          </div>
          <div className="max-w-3xl text-center">
            <p className="text-xl md:text-2xl font-medium italic text-white leading-relaxed mb-6">
              "After running the analysis, I found 6 specific skill gaps I had no idea about. The action plan told me exactly what to add and in what order. Rewrote my resume in one afternoon."
            </p>
            <span className="text-xs tracking-widest text-white font-bold">
              <br />— BETA TESTER FEEDBACK
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SocialProofSection;
