import React from 'react';

const ProblemSection = () => {
  return (
    <section className="w-full bg-neutral-900/40 backdrop-blur-md py-32 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-white uppercase">THE PROBLEM</span>
          <h2 className="text-4xl font-bold mt-4 text-white">You're Applying Blindly</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* WITHOUT */}
          <div className="p-10 rounded-3xl bg-red-500/10 border border-red-500/20">
            <h3 className="text-xl font-bold mb-8 text-white">WITHOUT RESUMEAI</h3>
            <ul className="space-y-5">
              {[
                "Submitting resumes with no feedback loop",
                "ATS systems rejecting you before a human sees your resume",
                "No idea which skills are disqualifying you",
                'Generic advice like "use action verbs"',
                "Spending hours guessing what to fix"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-white">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* WITH */}
          <div className="p-10 rounded-3xl border shadow-2xl bg-green-600/20 border-green-500/40">
            <h3 className="text-xl font-bold mb-8 text-white">WITH RESUMEAI PRO</h3>
            <ul className="space-y-5">
              {[
                "8 diagnostic engines identify every specific deficiency",
                "ATS compatibility score with exact keyword gaps",
                "Skill gap analysis against your target job title",
                "Prioritized action plan with estimated fix time per item",
                "Every recommendation traced to a specific resume weakness"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-white">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
