import React from 'react';

const TestimonialSection = () => {
  return (
    <section className="relative z-10 w-full py-24 flex justify-center px-6">
      <div className="max-w-3xl text-center">
        <blockquote className="text-[1.5rem] leading-[1.6] text-obsidian-on-surface font-medium italic mb-8">
          "After using the analysis, I found 6 specific skill gaps I had no idea about. The action plan told me exactly what to add and in what order. Rewrote my resume in an afternoon."
        </blockquote>
        <div className="text-[0.6875rem] uppercase tracking-widest text-obsidian-on-surface-variant font-bold">
          — Beta Tester Feedback
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
