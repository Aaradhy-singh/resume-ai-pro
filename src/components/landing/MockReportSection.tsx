import React from 'react';
import { FileText, ListChecks } from 'lucide-react';

const MockReportSection = () => {
  return (
    <section className="w-full bg-black/40 backdrop-blur-md py-32 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-white uppercase">WHAT YOU GET</span>
            <h2 className="text-4xl font-bold mt-4 mb-6 text-white">A Full Diagnostic Report. Not Generic Tips.</h2>
            <p className="text-white leading-relaxed mb-8">Stop receiving advice like "be more concise." Get actionable technical feedback that actually matters to engineering managers and HR filters.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <FileText className="text-white w-5 h-5" />
                <span className="font-medium text-white">Direct Resume Annotations</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <ListChecks className="text-white w-5 h-5" />
                <span className="font-medium text-white">Prioritized Checklist</span>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-1 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
            <div className="bg-neutral-950 rounded-[calc(1.5rem-4px)] p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 border-b border-white/10 pb-8">
                <div className="text-center sm:text-left">
                  <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">DIAGNOSTIC EXPORT</h4>
                  <p className="text-lg font-semibold text-white">Resume_Analysis_v4.pdf</p>
                </div>
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white leading-none">72</div>
                    <div className="text-[10px] text-white/60 font-bold uppercase">/ 100</div>
                  </div>
                  <svg className="absolute -inset-1 w-26 h-26 rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle className="opacity-80" cx="50" cy="50" fill="none" r="48" stroke="white" strokeDasharray="301.59" strokeDashoffset="84.44" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">ATS Compatibility</p>
                  <p className="text-xl font-bold text-white">65%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Skill Alignment</p>
                  <p className="text-xl font-bold text-white">80%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Keyword Density</p>
                  <p className="text-xl font-bold text-red-500">LOW</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Quantifiable Impact</p>
                  <p className="text-sm font-bold text-white leading-tight">4 Bullet points need improvement</p>
                </div>
              </div>
              <div className="space-y-6">
                <h5 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">YOUR PRIORITIZED ACTION PLAN</h5>
                <div className="space-y-4">
                  <div className="flex gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <span className="text-red-500 font-bold text-sm">01</span>
                    <div>
                      <p className="text-xs font-bold text-red-500 mb-1 uppercase tracking-wider">(CRITICAL) - KEYWORDS MISSING</p>
                      <p className="text-sm text-white leading-relaxed">Embed these keywords from your target job description: <span className="font-bold">'Distributed Systems', 'Cloud Security', 'Kubernetes'</span>.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <span className="text-orange-500 font-bold text-sm">02</span>
                    <div>
                      <p className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-wider">(HIGH) - LACKS METRICS</p>
                      <p className="text-sm text-white leading-relaxed">Quantify the results in your 'Project Lead' section. (e.g., <span className="italic">'Reduced costs by 15%'</span>).</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 border border-white/10 rounded-2xl bg-yellow-500/10 border-yellow-500/20">
                    <span className="text-yellow-500 font-bold text-sm">03</span>
                    <div>
                      <p className="text-xs font-bold text-yellow-500 mb-1 uppercase tracking-wider">(MEDIUM) - HIERARCHY</p>
                      <p className="text-sm text-white leading-relaxed">Move the <span className="font-bold">Skills</span> section above your Education to highlight core competencies first.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockReportSection;
