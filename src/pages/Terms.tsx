import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', padding: '80px 24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#0EA5E9', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← BACK TO HOME</Link>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '40px', marginTop: '32px', marginBottom: '8px' }}>Terms of Use</h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#666666', marginBottom: '40px' }}>Last updated: March 2026</p>

        {[
          { title: 'Acceptance', content: 'By using ResumeAI Pro you agree to these terms. If you do not agree, do not use the service.' },
          { title: 'Free Service', content: 'ResumeAI Pro is provided free of charge with no guarantee of uptime, accuracy, or availability. The service may be modified or discontinued at any time without notice.' },
          { title: 'No Warranty', content: 'ResumeAI Pro provides diagnostic analysis for informational purposes only. The scores, skill gap assessments, and recommendations are algorithmically generated and may not accurately reflect your actual qualifications or job market fit. Do not make major career decisions based solely on ResumeAI Pro output.' },
          { title: 'Accuracy Disclaimer', content: 'The skill matching engines use a rule-based ontology with 116 canonical skills. Skills not in the ontology may not be detected. JD alignment scores are approximate. GitHub portfolio scores depend on public API data which may be incomplete.' },
          { title: 'Intellectual Property', content: 'ResumeAI Pro is built and maintained by Aaradhy Singh. The codebase is open source and available on GitHub. You may not use the brand name, design, or analysis engines commercially without permission.' },
          { title: 'Limitation of Liability', content: 'ResumeAI Pro and its creator are not liable for any damages arising from your use of the service, including but not limited to missed job opportunities, incorrect skill assessments, or data loss.' },
          { title: 'Contact', content: 'For questions about these terms, contact aaradhysingh12@gmail.com.' },
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

export default Terms;
