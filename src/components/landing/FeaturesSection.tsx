import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Brain, TrendingUp, Key, Layers, CheckSquare } from 'lucide-react';

const FeaturesSection = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Settings className="text-white w-6 h-6" />, title: 'ATS COMPATIBILITY', desc: 'See exactly how parsing algorithms see your data. Fix layout issues instantly.' },
    { icon: <Brain className="text-white w-6 h-6" />, title: 'SKILL GAP ANALYSIS', desc: 'Compares your profile to 50k+ successful hires in your target role.' },
    { icon: <TrendingUp className="text-white w-6 h-6" />, title: 'IMPACT SCORING', desc: 'Evaluates if your bullet points quantify achievements or just list duties.' },
    { icon: <Key className="text-white w-6 h-6" />, title: 'KEYWORD ALIGNMENT', desc: 'Identifies missing high-intent keywords that recruiters search for.' },
    { icon: <Layers className="text-white w-6 h-6" />, title: 'EXPERIENCE DEPTH', desc: 'Checks for superficial descriptions and suggests deeper technical detail.' },
    { icon: <CheckSquare className="text-white w-6 h-6" />, title: 'ACTION PLAN', desc: 'A step-by-step checklist ranked by "Impact on Hireability".' }
  ];

  return (
    <section className="w-full bg-black/40 backdrop-blur-md py-32 border-b border-white/5" id="features">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-white uppercase">8 ANALYSIS ENGINES</span>
          <h2 className="text-4xl font-bold mt-4 text-white">Every Weakness. Diagnosed. Prioritized.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-sm text-white leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/upload')}
            className="bg-white text-black px-10 py-4 rounded-full font-bold transition-all hover:scale-105"
          >
            Analyze My Resume
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
