import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BottomCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-black/60 backdrop-blur-md py-32">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Stop Guessing. Start Fixing.</h2>
        <p className="text-white mb-12 max-w-xl mx-auto">Free. No account. No data leaves your browser. Get your prioritized action plan in under 30 seconds.</p>
        <button 
          onClick={() => navigate('/upload')}
          className="bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-white/10"
        >
          Analyze My Resume
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </section>
  );
};

export default BottomCtaSection;
