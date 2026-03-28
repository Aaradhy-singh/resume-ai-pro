import { Link } from "react-router-dom";

const Terms = () => (
  <div className="min-h-screen bg-black font-mono text-white px-6 py-16">
    <div className="max-w-[720px] mx-auto">
      <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-4">Legal</div>
      <h1 className="font-serif text-[32px] font-normal mb-8">Terms of Service</h1>
      <p className="text-[#888] text-[11px] mb-8">Last updated: 2026</p>

      <div className="flex flex-col gap-8 text-[13px] text-[#C0C0C0] leading-relaxed">
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">1. Acceptance</h2>
          <p>By using ResumeAI Pro you agree to these terms. If you do not agree, please do not use the service.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">2. Service Description</h2>
          <p>ResumeAI Pro provides resume analysis, career gap detection, and AI-powered writing assistance. Results are provided for informational purposes only and do not constitute career or legal advice.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">3. User Responsibilities</h2>
          <p>You are responsible for the content you submit for analysis. Do not submit resumes containing sensitive personal information beyond what is needed for job applications. You retain full ownership of your content.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">4. AI-Generated Content</h2>
          <p>AI features (bullet rewriting, interview questions, summaries) use the Google Gemini API. Output is AI-generated and may contain inaccuracies. Always review AI suggestions before using them in your resume.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">5. Disclaimer of Warranties</h2>
          <p>The service is provided "as is" without warranties of any kind. We do not guarantee employment outcomes or the accuracy of scoring results.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, ResumeAI Pro and its creator shall not be liable for any indirect, incidental, or consequential damages arising from use of the service.</p>
        </section>
        <section>
          <h2 className="text-white text-[14px] uppercase tracking-widest mb-3">7. Contact</h2>
          <p>Questions about these terms: <a href="mailto:contact@resumeaipro.com" className="text-[#0EA5E9]">contact@resumeaipro.com</a></p>
        </section>
      </div>

      <Link to="/" className="inline-block mt-12 text-[#0EA5E9] text-[11px] uppercase tracking-widest">
        ← Back to Home
      </Link>
    </div>
  </div>
);

export default Terms;
