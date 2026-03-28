import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-black font-mono text-white px-6 py-16">
    <div className="max-w-[720px] mx-auto">
      <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-4">Legal</div>
      <h1 className="font-serif text-[32px] font-normal mb-8">Privacy Policy</h1>
      <p className="text-[#888] text-[11px] mb-8">Last updated: 2026</p>

      <div className="flex flex-col gap-8 text-[13px] text-[#C0C0C0] leading-relaxed">
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">1. Data We Collect</h2>
          <p>ResumeAI Pro processes your resume text and job description locally in your browser. We do not store or transmit your resume content to any server. Optional GitHub analysis fetches only public repository metadata. Anonymous usage analytics are collected via PostHog to improve the product.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">2. Gemini AI Features</h2>
          <p>If you use AI-powered features (bullet rewriting, interview questions, summary generation), your selected resume text is sent to the Google Gemini API under their privacy policy. No personal identifying information is sent by default.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">3. Cloud Sync (Optional)</h2>
          <p>If you sign in via Supabase, your analysis history is stored in a secured database. You can delete your data at any time by contacting us.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">4. Cookies</h2>
          <p>We use session storage to temporarily hold your analysis results. This data is cleared when you close your browser tab. No persistent tracking cookies are set by this application.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">5. Contact</h2>
          <p>For privacy inquiries, email <a href="mailto:contact@resumeaipro.com" className="text-[#0EA5E9]">contact@resumeaipro.com</a>.</p>
        </section>
      </div>

      <Link to="/" className="inline-block mt-12 text-[#0EA5E9] text-[11px] uppercase tracking-widest">
        ← Back to Home
      </Link>
    </div>
  </div>
);

export default PrivacyPolicy;
