import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnalyzeClick = () => {
    navigate('/upload');
  };

  const faqs = [
    {
      q: "Do I need to create an account?",
      a: "No. There is no login, no signup, and no account required. Open the app, upload your resume, and get results immediately."
    },
    {
      q: "Does my resume data get sent to a server?",
      a: "No. All analysis runs locally in your browser using client-side engines. Your resume never leaves your device."
    },
    {
      q: "What file types can I upload?",
      a: "PDF and DOCX. The parser extracts structured text from both formats automatically."
    },
    {
      q: "Do I need to paste a job description?",
      a: "No, but it helps. Without a job description the engines still run career stage detection, skill gap analysis, role matching, impact scoring, and the action plan. Adding a job description unlocks keyword alignment scoring and targeted gap analysis."
    },
    {
      q: "How long does the analysis take?",
      a: "Under 10 seconds. All 8 engines run simultaneously."
    },
    {
      q: "What does the export report contain?",
      a: "A 9-section text report covering: career stage, JD alignment, top role match with all fit dimensions, other role matches, keyword gaps, bullet specificity, bullet rewrites, action plan, and project complexity analysis."
    },
    {
      q: "What is Career Explorer?",
      a: "A tool that lets you browse 338 roles across 38 industries. Each role shows required skills, experience expectations, salary bands, and career progression paths."
    },
    {
      q: "Is this free?",
      a: "Yes. Every engine, every score, every export is completely free. No hidden tiers, no trial limits."
    }
  ];

  const featureCards = [
    { name: 'ATS COMPATIBILITY', desc: 'Checks keyword density, formatting, and parsability against your target role.' },
    { name: 'SKILL GAP ANALYSIS', desc: 'Identifies missing core and supporting skills weighted by job title requirements.' },
    { name: 'IMPACT SCORING', desc: 'Flags bullet points with no quantified results and shows you exactly what to add.' },
    { name: 'KEYWORD ALIGNMENT', desc: 'Maps your resume vocabulary against the job description term by term.' },
    { name: 'EXPERIENCE DEPTH', desc: "Evaluates whether your seniority signals match the role level you're targeting." },
    { name: 'ACTION PLAN', desc: 'Delivers a prioritized fix list with effort estimates and traceable deficiency sources.' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#0EA5E9] selection:text-black font-sans overflow-x-hidden">
      <style>{`
        .font-serif { font-family: 'DM Serif Display', serif; }
        .font-sans { font-family: inherit; }
        .nav-link-underline { position: relative; }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #0EA5E9;
          transition: width 0.3s ease;
        }
        .nav-link-underline:hover::after { width: 100%; }
        .list-icon-red { color: #EF4444 !important; }
        .list-icon-green { color: #10B981 !important; }
      `}</style>

      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-colors duration-200 ${scrolled ? 'bg-[#000000] border-b border-[#1A1A1A]' : 'bg-[#000000]'}`}>
        <div className="max-w-[1100px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="font-serif text-[20px] text-white tracking-wide">
            ResumeAI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="nav-link-underline text-[11px] uppercase tracking-widest text-white hover:text-[#0EA5E9] transition-colors">FEATURES</a>
            <a href="#how-it-works" className="nav-link-underline text-[11px] uppercase tracking-widest text-white hover:text-[#0EA5E9] transition-colors">HOW IT WORKS</a>
            <a href="#faq" className="nav-link-underline text-[11px] uppercase tracking-widest text-white hover:text-[#0EA5E9] transition-colors">FAQ</a>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div style={{ width: '20px', height: '2px', background: 'white', marginBottom: '5px', transition: 'all 200ms' }} />
            <div style={{ width: '20px', height: '2px', background: 'white', marginBottom: '5px' }} />
            <div style={{ width: '20px', height: '2px', background: 'white' }} />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full z-40 bg-[#000000] border-b border-[#1A1A1A]">
          <div className="flex flex-col px-6 py-4 gap-0">
            {[
              { label: 'FEATURES', href: '#features' },
              { label: 'HOW IT WORKS', href: '#how-it-works' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-widest text-white hover:text-[#0EA5E9] transition-colors py-4 border-b border-[#1A1A1A] font-sans"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAnalyzeClick();
              }}
              className="mt-4 bg-[#0EA5E9] text-[#000000] text-[11px] uppercase tracking-widest font-sans px-5 py-3 rounded-none w-full"
            >
              ANALYZE MY RESUME →
            </button>
          </div>
        </div>
      )}

      <main className="pb-20">
        {/* 2. MAIN HERO (FULL HEIGHT) */}
        <section className="min-h-[100dvh] flex flex-col justify-center pt-24 pb-12">
          
          {/* HERO CONTENT */}
          <div
            className="relative px-6 max-w-[1100px] mx-auto text-center flex flex-col items-center w-full mb-20"
          >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 110% 70% at 50% 5%, rgba(14,165,233,0.22) 0%, rgba(14,165,233,0.06) 45%, transparent 70%)',
              zIndex: 0,
            }}
          />

          {/* Decorative rule above heading */}
          <div style={{
            width: '32px',
            height: '2px',
            background: '#0EA5E9',
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1,
          }} />

          {/* Main heading */}
          <h1
            className="font-serif leading-[1.05] mb-6 text-white"
            style={{
              fontSize: 'clamp(44px, 8vw, 88px)',
              position: 'relative',
              zIndex: 1,
              maxWidth: '900px',
              letterSpacing: '-0.02em',
            }}
          >
            Know Exactly Why You&apos;re Getting Rejected
          </h1>

          {/* Subtitle */}
          <p
            className="font-sans leading-[1.9] mb-10"
            style={{
              fontSize: '14px',
              color: '#E0E0E0',
              maxWidth: '480px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            ResumeAI Pro runs 8 diagnostic engines on your resume — skill gaps, ATS compatibility, impact scoring — and gives you a prioritized action plan.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <button
              onClick={handleAnalyzeClick}
              className="font-sans text-[11px] uppercase tracking-widest px-8 py-4 transition-all duration-200"
              style={{
                background: '#0EA5E9',
                color: '#000000',
                border: '1px solid #0EA5E9',
                cursor: 'pointer',
                fontWeight: 'bold',
                letterSpacing: '0.15em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0EA5E9';
                e.currentTarget.style.borderColor = '#0EA5E9';
              }}
            >
              ANALYZE MY RESUME →
            </button>
            <a
              href="#how-it-works"
              className="font-sans text-[11px] uppercase tracking-widest px-8 py-4 transition-all duration-200"
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid #4A4A4A',
                cursor: 'pointer',
                letterSpacing: '0.15em',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0EA5E9';
                e.currentTarget.style.color = '#0EA5E9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#4A4A4A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              SEE HOW IT WORKS
            </a>
          </div>
          </div>

          {/* 3. SOCIAL PROOF BAR */}
          <div className="relative z-40 max-w-[1100px] mx-auto px-6 w-full mt-10">
            <div className="text-center text-[10px] text-[#E0E0E0] uppercase tracking-widest mb-8">
              Trusted by job seekers targeting
            </div>
            <div className="flex flex-wrap justify-center sm:justify-between items-center gap-8">
              {/* Logos mocked as text for robustness over unknown assets */}
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>Google</span>
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>Amazon</span>
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>Meta</span>
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>Microsoft</span>
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>OpenAI</span>
              <span className="font-serif text-2xl" style={{ color: '#E0E0E0' }}>Stripe</span>
            </div>
          </div>
        </section>

        {/* --- END MAIN HERO --- */}

        <section className="relative z-40 bg-black pt-16 max-w-[1100px] mx-auto px-6 mb-16">
          <div className="max-w-3xl mx-auto bg-[#0D0D0D] border border-[#3A3A3A] p-8 sm:p-12 ui-box-override" style={{ boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}>
            <p className="text-[13px] text-white leading-relaxed mb-6 font-sans">
              &ldquo;After running the analysis, I found 6 specific skill gaps I had no idea about. The action plan told me exactly what to add and in what order. Rewrote my resume in one afternoon.&rdquo;
            </p>
            <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest font-sans">
              — BETA TESTER FEEDBACK
            </div>
          </div>
        </section>

        {/* 5. PROBLEM → SOLUTION */}
        <section className="max-w-[1100px] mx-auto px-6 mb-32">
          <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-4 font-sans">
            THE PROBLEM
          </div>
          <h2 className="font-serif text-[40px] text-white mb-12">
            You're Applying Blind
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0D0D0D] border border-[#3A3A3A] border-l-[3px] border-l-[#EF4444] p-8 sm:p-10 ui-box-override" style={{ boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}>
              <div className="text-[14px] text-white mb-8 border-b border-[#737373] pb-4 tracking-widest uppercase font-sans">
                Without ResumeAI Pro
              </div>
              <ul className="space-y-6" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Submitting resumes with no feedback loop','ATS systems rejecting you before a human sees your resume','No idea which skills are disqualifying you','Generic advice like "use action verbs"','Spending hours guessing what to fix'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9A9A9A', alignItems: 'flex-start', listStyle: 'none' }}>
                    <span className="list-icon-red" style={{ flexShrink: 0, fontWeight: 'bold', fontSize: '16px', lineHeight: 1 }}>✕</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0D0D0D] border border-[#3A3A3A] border-l-[3px] border-l-[#10B981] p-8 sm:p-10 ui-box-override" style={{ boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}>
              <div className="text-[14px] text-white mb-8 border-b border-[#737373] pb-4 tracking-widest uppercase font-sans">
                With ResumeAI Pro
              </div>
              <ul className="space-y-6" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['8 diagnostic engines identify every specific deficiency','ATS compatibility score with exact keyword gaps','Skill gap analysis against your target job title','Prioritized action plan with estimated fix time per item','Every recommendation traced to a specific resume weakness'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#F0F0F0', alignItems: 'flex-start', listStyle: 'none' }}>
                    <span className="list-icon-green" style={{ flexShrink: 0, fontWeight: 'bold', fontSize: '16px', lineHeight: 1 }}>✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6. FEATURES / BENEFITS */}
        <section id="features" className="max-w-[1100px] mx-auto px-6 mb-32 pt-16 -mt-16">
          <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-4 font-sans">
            8 ANALYSIS ENGINES
          </div>
          {/* Decorative rule */}
          <div style={{ width: '32px', height: '2px', background: '#0EA5E9', marginBottom: '16px' }} />
          <h2
            className="font-serif text-white mb-16"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.01em' }}
          >
            Every Weakness. Diagnosed. Prioritized.
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 ui-box-override">
            {featureCards.map((card) => (
              <div
                key={card.name}
                style={{
                  background: '#0D0D0D',
                  border: '1px solid #3A3A3A',
                  borderTop: '2px solid #0EA5E9',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
                  padding: '28px 24px',
                  position: 'relative',
                  cursor: 'default',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#0EA5E9';
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 12px 40px rgba(14,165,233,0.12)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#737373';
                  el.style.borderTopColor = '#0EA5E9';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.05)';
                }}
              >
                <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-3 font-sans">{card.name}</div>
                <div className="text-[13px] text-[#E0E0E0] leading-relaxed">{card.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleAnalyzeClick}
              className="font-sans text-[11px] uppercase tracking-widest px-8 py-4 transition-all duration-200 inline-block"
              style={{
                background: '#0EA5E9',
                color: '#000000',
                border: '1px solid #0EA5E9',
                cursor: 'pointer',
                fontWeight: 'bold',
                letterSpacing: '0.15em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0EA5E9';
                e.currentTarget.style.borderColor = '#0EA5E9';
              }}
            >
              ANALYZE MY RESUME →
            </button>
          </div>
        </section>

        {/* 7. HOW IT WORKS */}
        <section id="how-it-works" className="max-w-[1100px] mx-auto px-6 mb-32 pt-16 -mt-16">
          <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-4 font-sans">
            THREE STEPS
          </div>
          {/* Decorative rule */}
          <div style={{ width: '32px', height: '2px', background: '#0EA5E9', marginBottom: '16px' }} />
          <h2
            className="font-serif text-white mb-16"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.01em' }}
          >
            Upload. Analyze. Fix.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="ui-box-override" style={{ position: 'relative', overflow: 'hidden', background: '#0D0D0D', border: '1px solid #3A3A3A', boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)', padding: '32px 28px' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '12px', fontFamily: "inherit", fontSize: '160px', color: '#0EA5E9', opacity: 0.05, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', zIndex: 0, letterSpacing: '-0.05em' }}>01</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="text-[12px] text-white uppercase tracking-widest mb-4 font-sans">— UPLOAD YOUR RESUME</div>
                <p className="text-[12px] text-[#E0E0E0] leading-relaxed">
                  Upload your PDF or DOCX resume file. Optionally paste a job description to enable keyword alignment scoring and gap analysis. No account required.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="ui-box-override" style={{ position: 'relative', overflow: 'hidden', background: '#0D0D0D', border: '1px solid #3A3A3A', boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)', padding: '32px 28px' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '12px', fontFamily: "inherit", fontSize: '160px', color: '#0EA5E9', opacity: 0.05, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', zIndex: 0, letterSpacing: '-0.05em' }}>02</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="text-[12px] text-white uppercase tracking-widest mb-4 font-sans">— RUN 8 DIAGNOSTIC ENGINES</div>
                <p className="text-[12px] text-[#E0E0E0] leading-relaxed">
                  Career stage detection, skill gap analysis, ATS compatibility, impact scoring, keyword alignment, experience depth, and role matching all run simultaneously. Results in under 10 seconds.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="ui-box-override" style={{ position: 'relative', overflow: 'hidden', background: '#0D0D0D', border: '1px solid #3A3A3A', boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)', padding: '32px 28px' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '12px', fontFamily: "inherit", fontSize: '160px', color: '#0EA5E9', opacity: 0.05, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', zIndex: 0, letterSpacing: '-0.05em' }}>03</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="text-[12px] text-white uppercase tracking-widest mb-4 font-sans">— EXECUTE YOUR ACTION PLAN</div>
                <p className="text-[12px] text-[#E0E0E0] leading-relaxed">
                  Work through a prioritized fix list with effort estimates per item. Check off completed fixes. Export a full report to track progress. Every recommendation is traced to a specific resume deficiency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SAMPLE REPORT SECTION */}
        <section id="sample-report" className="max-w-[1100px] mx-auto px-6 mb-32">
          <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-4 font-sans">
            WHAT YOU GET
          </div>
          <h2 className="font-serif text-[40px] text-white mb-12">
            A Full Diagnostic Report. Not Generic Tips.
          </h2>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-2/3 w-full bg-[#0D0D0D] border border-[#3A3A3A] aspect-[16/10] relative p-6 sm:p-10 flex flex-col uppercase font-sans tracking-widest ui-box-override" style={{ boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}>
              <div className="flex justify-between items-center mb-10 border-b border-[#737373] pb-6">
                <div className="text-white text-[16px]">DIAGNOSTIC EXPORT</div>
                <div className="text-[#0EA5E9] text-[12px]">CONFIDENTIAL</div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-[#E0E0E0] text-[10px] mb-2">Overall Readability</div>
                  <div className="text-white text-[14px]">8.5/10</div>
                </div>
                <div>
                  <div className="text-[#E0E0E0] text-[10px] mb-2">Keyword Density</div>
                  <div className="text-[#EF4444] text-[14px]">Low</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="border border-[#737373] p-4 flex gap-4">
                  <div className="text-[#0EA5E9] text-[12px]">01</div>
                  <div>
                    <div className="text-[12px] text-white mb-1">Missing Core Skill: System Design</div>
                    <div className="text-[10px] text-[#E0E0E0]">Your target role requires this. Add 1-2 examples to experience.</div>
                  </div>
                </div>
                <div className="border border-[#737373] p-4 flex gap-4">
                  <div className="text-[#0EA5E9] text-[12px]">02</div>
                  <div>
                    <div className="text-[12px] text-[#E0E0E0] mb-1">Impact Unquantified</div>
                    <div style={{ fontSize: '10px', color: '#FFFFFF', fontFamily: "inherit" }}>Line 14 lacks measurable results. Add metrics (e.g., % improvement).</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 w-full space-y-6">
              {[
                '9-section PDF export with scores, gaps, and fix recommendations',
                'Every item linked to the exact resume deficiency that triggered it',
                'Shareable with recruiters, mentors, or career coaches',
              ].map((t) => (
                <div key={t} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '2px', minHeight: '40px', background: '#0EA5E9', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontFamily: "inherit", fontSize: '12px', color: '#E0E0E0', lineHeight: 1.7 }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="max-w-[700px] mx-auto px-6 mb-32 pt-16 -mt-16">
          <div className="text-center mb-12">
            <div className="text-[10px] text-[#0EA5E9] uppercase tracking-widest mb-4 font-sans">
              FAQ
            </div>
            {/* Decorative rule */}
            <div style={{ width: '32px', height: '2px', background: '#0EA5E9', margin: '0 auto 16px auto' }} />
            <h2 className="font-serif text-[40px] text-white">
              Questions?
              <span style={{ fontFamily: "inherit", fontSize: '10px', color: '#666666', border: '1px solid #444444', padding: '2px 8px', marginLeft: '12px', verticalAlign: 'middle' }}>
                {faqs.length}
              </span>
            </h2>
          </div>

          <div style={{ borderTop: '1px solid #1A1A1A' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #1A1A1A' }}>
                <button
                  className="w-full text-left py-6 flex justify-between items-center focus:outline-none group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[13px] text-[#E0E0E0] font-sans group-hover:text-[#0EA5E9] transition-colors pr-8">
                    {faq.q}
                  </span>
                  <span style={{
                    fontFamily: "inherit",
                    fontSize: '18px',
                    color: '#0EA5E9',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 font-sans text-[12px] text-[#E0E0E0] leading-relaxed ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. FINAL CTA */}
        <section style={{
          borderTop: '1px solid #1A1A1A',
          padding: '80px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 120% at 50% 110%, rgba(14,165,233,0.18) 0%, rgba(14,165,233,0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              width: '32px',
              height: '2px',
              background: '#0EA5E9',
              margin: '0 auto 24px auto',
            }} />
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: '#FFFFFF',
              fontWeight: 'normal',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}>
              Stop Guessing. Start Fixing.
            </h2>
            <p style={{
              fontFamily: "inherit",
              fontSize: '13px',
              color: '#E0E0E0',
              marginBottom: '32px',
              lineHeight: 1.8,
            }}>
              Free. No account. No data leaves your browser.
            </p>
            <button
              onClick={handleAnalyzeClick}
              style={{
                background: '#0EA5E9',
                color: '#000000',
                fontFamily: "inherit",
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '14px 40px',
                border: '1px solid #0EA5E9',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0EA5E9';
                e.currentTarget.style.borderColor = '#0EA5E9';
              }}
            >
              ANALYZE MY RESUME →
            </button>
          </div>
        </section>
      </main>



      {/* 11. FOOTER */}
      <footer className="bg-[#000000] border-t border-[#1A1A1A] py-8">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-[16px] text-white tracking-wide">
            ResumeAI
          </div>
          <div className="flex gap-6 text-[10px] text-[#E0E0E0] uppercase tracking-widest font-sans">
            <a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#faq" className="hover:text-white transition-colors">Terms</a>
            <a href="#faq" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div style={{ fontSize: '10px', color: '#FFFFFF !important', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "inherit", opacity: 1 }}>© 2026 Aaradhy Singh. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
