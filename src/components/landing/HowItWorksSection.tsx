import React from 'react';

const HowItWorksSection = () => {
  return (
    <section className="w-full bg-neutral-900/40 backdrop-blur-md py-32 border-b border-white/5" id="how-it-works">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <span className="text-xs font-bold tracking-widest text-white uppercase">THREE STEPS</span>
        <h2 className="text-4xl font-bold mt-4 mb-20 text-white">Upload. Analyze. Fix.</h2>
        <div className="grid md:grid-cols-3 gap-16">
          <div className="relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 text-white">Secure Upload</h3>
              <p className="text-white text-sm leading-relaxed">Drop your PDF. All processing happens locally in your browser. Your data never leaves your device.</p>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 text-white">Deep Diagnostic</h3>
              <p className="text-white text-sm leading-relaxed">Our 8 engines dissect your resume against real-world hiring patterns and technical requirements.</p>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 text-white">Execute Fixes</h3>
              <p className="text-white text-sm leading-relaxed">Follow the prioritized roadmap. Check off items as you improve your resume in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
