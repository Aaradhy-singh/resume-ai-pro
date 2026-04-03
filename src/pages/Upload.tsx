import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResumeUpload } from "@/components/upload/ResumeUpload";
import { JobDescriptionInput } from "@/components/upload/JobDescriptionInput";
import { GitHubInput } from "@/components/upload/GitHubInput";
import { RoleExperienceInput } from "@/components/upload/RoleExperienceInput";
import { motion } from "framer-motion";
import { type ParsedResume } from "@/lib/parsers/resumeParser";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { safeStorage } from "@/lib/storage-safe"; // Added import for safeStorage
import { useToast } from "@/components/ui/use-toast"; // Added import for useToast
import posthog from 'posthog-js';

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast: shadcnToast } = useToast(); // Renamed to avoid conflict with sonner toast
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [experienceYears, setExperienceYears] = useState<number | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");

  const hasRequiredInput = parsedResume !== null && parsedResume.rawText.length > 100;
  const hasJobDescription = jobDescription.trim().length >= 100;

  const handleAnalyze = async () => {
    if (!parsedResume) {
      toast.error("Please upload a resume first");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Import the original orchestrator dynamically
      const { analyzeResume } = await import("@/lib/engines/analysis-orchestrator");

      toast.info("Starting evidence-based analysis...");

      // EXECUTE GROUNDED PIPELINE
      // This enforces: Validation -> Stage Classification -> Stage-Gated Scoring -> Verification
      posthog.capture('resume_analysis_started', {
        hasJobDescription: !!jobDescription,
        hasGithubUsername: !!githubUsername,
        targetRole: targetRole || 'none',
      });
      const results = await analyzeResume(
        parsedResume,
        hasJobDescription ? jobDescription : undefined,
        githubUsername.trim().length > 0 ? githubUsername.trim() : undefined,
        experienceYears ?? undefined,
        targetRole.trim().length > 0 ? targetRole.trim() : undefined
      );

      // Store complete grounded analysis results using safeStorage
      posthog.capture('resume_analysis_completed', {
        overallScore: results.scores?.keywordCoverage?.overallScore ?? 0,
        careerStage: results.careerStage?.stage ?? 'unknown',
        topRole: results.roles?.topRoles?.[0]?.occupation?.title ?? 'unknown',
      });
      const success = safeStorage.setItem("resumeAnalysis", JSON.stringify(results));
      if (!success) {
        shadcnToast({ // Using shadcnToast for storage error
          title: "Storage Error",
          description: "Result too large. Could not store analysis.",
          variant: "destructive"
        });
        return;
      }

      toast.success("Analysis complete! Redirecting...");
      navigate("/results");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dynamic Loading State
  const loadingMessages = [
    "Parsing formatting...",
    "Extracting keywords...",
    "Evaluating experience depth...",
    "Generating action plan..."
  ];
  const [loadingStep, setLoadingStep] = useState(0);

  // Update loading message every 1.5 seconds when analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="pb-6 mb-8 text-white">
          <p className="font-mono text-[11px] text-gray-300 tracking-[0.2em] uppercase mb-2">ANALYZE RESUME</p>
          <h1 className="font-serif text-[32px] font-normal m-0 mb-2 leading-[1.1] text-white">Upload Your Resume</h1>
          <p className="font-mono text-[14px] text-gray-300 m-0 leading-[1.7]">
            Upload PDF or DOCX. Analysis runs entirely in your browser.
          </p>
        </div>

        {/* --- WIZARD STEP 1 --- */}
        <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg p-6">
          <h2 className="text-[11px] text-white tracking-[0.2em] uppercase mb-4 font-mono">Step 1: Your Resume</h2>
          
          <ResumeUpload onParsed={setParsedResume} />
          
          {/* Empty State Hint Block moved inside Step 1 or kept outside, let's keep it here for now if no resume string */}
          {!parsedResume && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { num: '01', label: 'WHAT HAPPENS NEXT', text: 'Your resume is parsed locally. No data is sent to any server.' },
                { num: '02', label: 'THEN', text: 'Paste a job description to get a keyword alignment score and gap analysis.' },
                { num: '03', label: 'FINALLY', text: 'Get a prioritized action plan, role matches, and bullet rewrites.' },
              ].map((item) => (
                <div key={item.label} className="bg-[#111111] border border-white/20 rounded-xl shadow-lg p-4">
                  <div className="font-serif text-[24px] text-white leading-none mb-2">{item.num}</div>
                  <p className="font-mono text-[11px] text-gray-300 tracking-[0.2em] uppercase mb-2">{item.label}</p>
                  <p className="font-mono text-[14px] text-gray-300 leading-[1.6]">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- WIZARD STEPS 2 & 3 (Visible after resume upload) --- */}
        {parsedResume && (
          <>
            {/* --- WIZARD STEP 2 --- */}
            <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg p-6">
              <h2 className="text-[11px] text-white tracking-[0.2em] uppercase mb-4 font-mono">Step 2: Target Role & JD</h2>
              
              <div className="space-y-6">
                <JobDescriptionInput onJobDescriptionChange={setJobDescription} />
                <RoleExperienceInput
                  onExperienceChange={setExperienceYears}
                  onTargetRoleChange={setTargetRole}
                />
              </div>
            </div>

            {/* --- WIZARD STEP 3 --- */}
            {/* Step 3: Developer Portfolio */}
            <GitHubInput
              onValidUsername={setGithubUsername}
            />

            {/* Analysis Button */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-[#111111] border border-white/20 rounded-xl shadow-lg p-6 flex items-center justify-between mt-8"
            >
              <div className="text-gray-300 text-[14px] font-mono">
                {!hasRequiredInput && "Upload a resume to continue"}
                {hasRequiredInput && !hasJobDescription && "Add job description for keyword coverage analysis"}
                {hasRequiredInput && hasJobDescription && "✓ Ready for complete analysis"}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={!hasRequiredInput || isAnalyzing}
                  style={{
                    background: isAnalyzing ? '#ffffff' : (hasRequiredInput ? '#ffffff' : '#444444'),
                    color: (hasRequiredInput && !isAnalyzing) ? '#000000' : '#888888',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 'bold',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '0px',
                    cursor: (!hasRequiredInput || isAnalyzing) ? 'not-allowed' : 'pointer',
                    minWidth: '240px',
                    transition: 'all 200ms ease',
                    position: 'relative'
                  }}
                >
                  {isAnalyzing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        border: '2px solid #000',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 600ms linear infinite'
                      }} />
                      {loadingMessages[loadingStep].toUpperCase()}
                    </span>
                  ) : 'RUN ANALYSIS'}
                </button>
                {isAnalyzing && (
                  <p style={{
                    fontSize: '11px',
                    color: '#FFFFFF',
                    textAlign: 'right',
                    animation: 'pulse 1.5s ease infinite'
                  }}>
                    {loadingMessages[loadingStep]}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
