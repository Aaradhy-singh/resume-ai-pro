import React from 'react';
import { ChevronDown } from 'lucide-react';

const FaqSection = () => {
  const faqs = [
    { q: "Is my data secure?", a: "Yes. All analysis happens directly in your browser using local processing. Your resume is never uploaded to our servers." },
    { q: "How does the ATS scanner work?", a: "We use the same parsing libraries used by major Applicant Tracking Systems like Greenhouse, Lever, and Workday to show you exactly how they interpret your data." },
    { q: "Can it help with non-tech roles?", a: "While optimized for tech (Software Engineering, PM, Design), the structural and impact analysis engines work for any professional role." },
    { q: "What is \"Impact Scoring\"?", a: "Impact scoring measures the \"outcome density\" of your bullet points. It looks for verbs, metrics, and business value rather than just a list of tasks." },
    { q: "Is this tool actually free?", a: "Yes, the basic diagnostic is free. No credit card required." },
    { q: "How often should I run an analysis?", a: "We recommend running it every time you make structural changes or before applying to a high-priority role." },
    { q: "Does it support multiple languages?", a: "Currently, we offer full support for English resumes. Multi-language support is in our product roadmap." },
    { q: "Who built this?", a: "Built by a team of ex-FAANG recruiters and engineering managers who were tired of seeing qualified candidates get filtered out by broken processes." }
  ];

  return (
    <section className="w-full bg-neutral-900/40 backdrop-blur-md py-32 border-b border-white/5" id="faq">
      <div className="max-w-4xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-white uppercase">FAQ</span>
          <h2 className="text-4xl font-bold mt-4 text-white">Questions?</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group glass-card rounded-2xl overflow-hidden" open={i === 0}>
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-white">{faq.q}</span>
                <ChevronDown className="text-white w-6 h-6 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-6 pt-0 text-white text-sm leading-relaxed border-t border-white/5">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
