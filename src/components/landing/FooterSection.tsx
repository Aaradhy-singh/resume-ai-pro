import React from 'react';

const FooterSection = () => {
  return (
    <footer className="w-full bg-black/80 backdrop-blur-xl border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl font-bold tracking-tighter text-white mb-6">ResumeAI Pro</div>
            <p className="text-sm text-white leading-relaxed">The last resume analyzer you'll ever need. Built by engineers, for engineers.</p>
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Product</h5>
            <ul className="space-y-4 text-sm text-white">
              <li><a className="hover:text-white transition-colors" href="#features">Features</a></li>
              <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); alert('ResumeAI Pro is completely free. No pricing, no tiers, no limits.'); }}>Pricing</a></li>
              <li><a className="hover:text-white transition-colors" href="#how-it-works">How it works</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Resources</h5>
            <ul className="space-y-4 text-sm text-white">
              <li><a className="hover:text-white transition-colors" href="mailto:aaradhysingh12@gmail.com">Help Center</a></li>
              <li><a className="hover:text-white transition-colors" href="/terms" target="_blank">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors" href="/privacy" target="_blank">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Connect</h5>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors" href="https://www.linkedin.com/in/aaradhy-singh/" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors" href="https://github.com/Aaradhy-singh" target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 text-xs text-white">
          <span>© 2026 Aradhy Singh. All Rights Reserved.</span>
          <div className="flex gap-8">
            <a className="hover:text-white" href="https://resume-ai-pro-psi.vercel.app" target="_blank">Status</a>
            <a className="hover:text-white" href="mailto:aaradhysingh12@gmail.com">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
