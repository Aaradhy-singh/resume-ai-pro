import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', padding: '80px 24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#0EA5E9', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← BACK TO HOME</Link>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '40px', marginTop: '32px', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#666666', marginBottom: '40px' }}>Last updated: March 2026</p>

        {[
          { title: 'No Data Collection', content: 'ResumeAI Pro does not collect, store, or transmit your resume data. All analysis runs entirely in your browser using client-side JavaScript engines. Your resume never leaves your device.' },
          { title: 'GitHub Integration', content: 'If you provide a GitHub username, ResumeAI Pro makes read-only API requests to the public GitHub API to analyze your public repositories. No private repository data is accessed. The GitHub API token used is rate-limited and scoped to public repositories only.' },
          { title: 'Analytics', content: 'We use PostHog analytics to track anonymous usage events such as analysis completion rates and feature usage. No personally identifiable information is collected. No resume content is ever sent to PostHog.' },
          { title: 'Cookies', content: 'ResumeAI Pro uses browser localStorage to temporarily store your analysis results so you can navigate between pages without re-running the analysis. This data is stored only on your device and is cleared when you start a new analysis.' },
          { title: 'Third Party Services', content: "ResumeAI Pro is hosted on Vercel. Vercel may collect standard web server logs including IP addresses and request timestamps as part of their infrastructure. See Vercel's privacy policy for details." },
          { title: 'Contact', content: 'If you have any questions about this privacy policy, contact us at aaradhysingh12@gmail.com.' },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{section.title}</h2>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#9A9A9A', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Privacy;
