import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { analyzeResume, type AnalysisResult } from "@/lib/engines/analysis-orchestrator";
import { safeStorage } from "@/lib/storage-safe";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { type ParsedResume } from "@/lib/parsers/resumeParser";
export default function AnalyzeResume() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [targetJobTitle, setTargetJobTitle] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showEmptyError, setShowEmptyError] = useState(false);

    const [lastAnalysis, setLastAnalysis] = useState<{ title: string, date: string, score: number } | null>(null);

    useEffect(() => {
        // See if there's a past analysis in session storage to display
        const stored = safeStorage.getItem("resumeAnalysis");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data && data.scores && data.scores.overall) {
                    setLastAnalysis({
                        title: data.jobTitle || "Resume Analysis",
                        date: new Date().toLocaleDateString(),
                        score: data.scores.overall
                    });
                }
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            setShowEmptyError(true);
            return;
        }
        setShowEmptyError(false);
        setIsAnalyzing(true);

        try {
            const { analyzeResume } = await import("@/lib/engines/analysis-orchestrator");

            const mockParsedResume: ParsedResume = {
                rawText: resumeText,
                metadata: {
                    fileName: "manual-input.txt",
                    fileSize: resumeText.length,
                    fileType: "text/plain",
                    parseTimestamp: new Date(),
                    parsingMethod: "txt"
                },
                parsingConfidence: 100,
                warnings: []
            };

            const results = await analyzeResume(
                mockParsedResume,
                jobDescription.trim() ? jobDescription : undefined,
                undefined
            );

            // Inject target job title into results if we need it later, though the orchestrator might not explicitly expect it here unless we pass it
            if (targetJobTitle.trim()) {
                (results as Record<string, unknown>).jobTitle = targetJobTitle;
            }

            const success = safeStorage.setItem("resumeAnalysis", JSON.stringify(results));
            if (!success) {
                toast({
                    title: "Storage Error",
                    description: "Result too large. Could not store analysis.",
                    variant: "destructive"
                });
                return;
            }
            navigate("/results");
        } catch (error) {
            console.error("Analysis error:", error);
            toast({
                title: "Analysis Failed",
                description: error instanceof Error ? error.message : "Analysis failed",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTitleSuggestionClick = (title: string) => {
        setTargetJobTitle(title);
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1100px] mx-auto px-6 pb-20 font-mono">

                {/* Header Block */}
                <div className="mb-10 pt-6">
                    <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-3">
                        RESUME ANALYSIS
                    </div>
                    <h1 className="font-serif text-[36px] text-white mb-3 font-normal">
                        Analyze Your Resume
                    </h1>
                    <p className="text-[#888888] text-[13px]">
                        Paste your resume text below. All 8 diagnostic engines will run simultaneously.
                    </p>
                </div>

                {/* Main Layout */}
                <div className="flex flex-wrap gap-6">

                    {/* LEFT COLUMN */}
                    <div className="flex-[1_1_60%] min-w-[300px] flex flex-col gap-6">

                        {/* Resume Text Input */}
                        <div>
                            <label className="block text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-2">
                                RESUME TEXT
                            </label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value);
                                    if (showEmptyError) setShowEmptyError(false);
                                }}
                                placeholder="Paste your full resume text here. Plain text works best. Include all sections: experience, skills, education, projects."
                                className={`w-full min-h-[320px] bg-[#0D0D0D] text-white font-mono text-[12px] p-4 resize-y outline-none transition-colors rounded-none ${showEmptyError ? 'border border-[#EF4444]' : 'border border-[#3A3A3A] focus:border-[#0EA5E9]'}`}
                            />
                            {showEmptyError && (
                                <div className="text-[#EF4444] text-[11px] mt-1">
                                    Resume text is required to run analysis.
                                </div>
                            )}
                            <div className="text-[#444444] text-[10px] text-right mt-1">
                                {resumeText.length} characters
                            </div>
                        </div>

                        {/* Job Description Input */}
                        <div>
                            <label className="block mb-2">
                                <span className="text-[#0EA5E9] text-[10px] uppercase tracking-widest">JOB DESCRIPTION</span>
                                <span className="text-[#444444] text-[10px] ml-2">OPTIONAL</span>
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description to enable keyword alignment and skill gap analysis against this specific role."
                                className="w-full h-40 bg-[#0D0D0D] border border-[#3A3A3A] focus:border-[#0EA5E9] text-white font-mono text-[12px] p-4 resize-y outline-none transition-colors rounded-none"
                            />
                        </div>

                        {/* Target Job Title Input */}
                        <div>
                            <label className="block text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-2">
                                TARGET JOB TITLE
                            </label>
                            <input
                                type="text"
                                value={targetJobTitle}
                                onChange={(e) => setTargetJobTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer, Prompt Engineer, Data Scientist"
                                className="w-full bg-[#0D0D0D] border border-[#3A3A3A] focus:border-[#0EA5E9] text-white font-mono text-[13px] px-4 py-3 outline-none transition-colors rounded-none"
                            />
                            {!targetJobTitle.trim() && resumeText.trim() && (
                                <div className="text-[#F59E0B] text-[11px] mt-1">
                                    No job title entered. Analysis will use generic scoring.
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-3">
                                {["Software Engineer", "Product Manager", "Data Scientist", "ML Engineer", "Prompt Engineer"].map((title) => (
                                    <button
                                        key={title}
                                        onClick={() => handleTitleSuggestionClick(title)}
                                        className="bg-[#111111] border border-[#3A3A3A] hover:border-[#0EA5E9] text-white font-mono text-[10px] px-[10px] py-1 cursor-pointer transition-colors rounded-none"
                                    >
                                        {title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div className="mt-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeText.trim() || isAnalyzing}
                                className={`w-full font-mono text-[12px] uppercase py-[14px] tracking-widest font-bold transition-colors rounded-none border-none ${!resumeText.trim() || isAnalyzing ? 'bg-[#1A1A1A] text-[#444444] cursor-not-allowed' : 'bg-[#0EA5E9] text-black cursor-pointer'}`}
                            >
                                {isAnalyzing ? (
                                    <span className="animate-pulse">ANALYZING...</span>
                                ) : (
                                    "RUN FULL DIAGNOSTIC →"
                                )}
                            </button>
                            <div className="text-[#444444] text-[10px] text-center mt-3">
                                8 engines · Results in under 10 seconds · No account required
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex-[1_1_38%] min-w-[300px] flex flex-col">

                        {/* What Gets Analyzed card */}
                        <div className="bg-[#0D0D0D] border border-[#3A3A3A] p-6">
                            <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-4">
                                WHAT GETS ANALYZED
                            </div>

                            <div className="flex flex-col">
                                {[
                                    { name: "ATS COMPATIBILITY", desc: "Keyword density, formatting, parsability" },
                                    { name: "SKILL GAP ANALYSIS", desc: "Missing core and supporting skills by role" },
                                    { name: "IMPACT SCORING", desc: "Quantified achievements detection" },
                                    { name: "KEYWORD ALIGNMENT", desc: "Resume vs job description term mapping" },
                                    { name: "EXPERIENCE DEPTH", desc: "Seniority signal evaluation" },
                                    { name: "EDUCATION MATCH", desc: "Degree and certification alignment" },
                                    { name: "PORTFOLIO SIGNALS", desc: "GitHub, projects, portfolio detection" },
                                    { name: "CAREER TRAJECTORY", desc: "Role progression and gap analysis" },
                                ].map((engine, i, arr) => (
                                    <div key={engine.name} className={`py-3 flex flex-col gap-1 ${i < arr.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
                                        <div className="text-white text-[11px]">{engine.name}</div>
                                        <div className="text-[#666666] text-[11px]">{engine.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-6 mt-4">
                            <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-4">
                                FOR BEST RESULTS
                            </div>
                            <div className="flex flex-col gap-3">
                                {[
                                    "Include your full resume — all sections, not just experience",
                                    "Paste the actual job description if you have one — not just the title",
                                    "Plain text is better than formatted text copied from a PDF",
                                ].map((tip, i) => (
                                    <div key={i} className="flex gap-2 text-[#666666] text-[11px] leading-relaxed">
                                        <span className="text-[#0EA5E9]">→</span>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Previous Analysis card */}
                        {lastAnalysis && (
                            <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-6 mt-4">
                                <div className="text-[#0EA5E9] text-[10px] uppercase tracking-widest mb-4">
                                    LAST ANALYSIS
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-white text-[13px] mb-1">{lastAnalysis.title}</div>
                                        <div className="text-[#666666] text-[11px]">{lastAnalysis.date} • Score: {lastAnalysis.score}</div>
                                    </div>
                                    <button
                                        onClick={() => navigate("/results")}
                                        className="bg-transparent border-none text-[#0EA5E9] text-[11px] cursor-pointer p-0 font-mono"
                                    >
                                        VIEW RESULTS →
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};
