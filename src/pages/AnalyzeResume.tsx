import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Briefcase, Github, ArrowRight } from "lucide-react";
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
                (results as any).jobTitle = targetJobTitle;
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
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", paddingBottom: "80px", fontFamily: "'DM Mono', monospace" }}>

                {/* Header Block */}
                <div style={{ marginBottom: "40px", paddingTop: "24px" }}>
                    <div style={{ color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                        RESUME ANALYSIS
                    </div>
                    <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#FFFFFF", margin: "0 0 12px 0", fontWeight: "normal" }}>
                        Analyze Your Resume
                    </h1>
                    <p style={{ color: "#888888", fontSize: "13px", margin: 0 }}>
                        Paste your resume text below. All 8 diagnostic engines will run simultaneously.
                    </p>
                </div>

                {/* Main Layout */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>

                    {/* LEFT COLUMN */}
                    <div style={{ flex: "1 1 60%", minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* Resume Text Input */}
                        <div>
                            <label style={{ display: "block", color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", marginBottom: "8px" }}>
                                RESUME TEXT
                            </label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value);
                                    if (showEmptyError) setShowEmptyError(false);
                                }}
                                placeholder="Paste your full resume text here. Plain text works best. Include all sections: experience, skills, education, projects."
                                style={{
                                    width: "100%",
                                    minHeight: "320px",
                                    background: "#0D0D0D",
                                    border: `1px solid ${showEmptyError ? "#EF4444" : "#3A3A3A"} `,
                                    color: "#FFFFFF",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "12px",
                                    padding: "16px",
                                    borderRadius: "0px",
                                    resize: "vertical",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={(e) => { if (!showEmptyError) e.target.style.borderColor = "#0EA5E9"; }}
                                onBlur={(e) => { if (!showEmptyError) e.target.style.borderColor = "#3A3A3A"; }}
                            />
                            {showEmptyError && (
                                <div style={{ color: "#EF4444", fontSize: "11px", marginTop: "4px" }}>
                                    Resume text is required to run analysis.
                                </div>
                            )}
                            <div style={{ color: "#444444", fontSize: "10px", textAlign: "right", marginTop: "4px", fontFeatureSettings: '"zero" 0, "ss01" 0, "ss02" 0', fontVariantNumeric: "normal" }}>
                                {resumeText.length} characters
                            </div>
                        </div>

                        {/* Job Description Input */}
                        <div>
                            <label style={{ display: "block", marginBottom: "8px" }}>
                                <span style={{ color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase" }}>JOB DESCRIPTION</span>
                                <span style={{ color: "#444444", fontSize: "10px", marginLeft: "8px" }}>OPTIONAL</span>
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description to enable keyword alignment and skill gap analysis against this specific role."
                                style={{
                                    width: "100%",
                                    height: "160px",
                                    background: "#0D0D0D",
                                    border: "1px solid #3A3A3A",
                                    color: "#FFFFFF",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "12px",
                                    padding: "16px",
                                    borderRadius: "0px",
                                    resize: "vertical",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#0EA5E9"}
                                onBlur={(e) => e.target.style.borderColor = "#3A3A3A"}
                            />
                        </div>

                        {/* Target Job Title Input */}
                        <div>
                            <label style={{ display: "block", color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", marginBottom: "8px" }}>
                                TARGET JOB TITLE
                            </label>
                            <input
                                type="text"
                                value={targetJobTitle}
                                onChange={(e) => setTargetJobTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer, Prompt Engineer, Data Scientist"
                                style={{
                                    width: "100%",
                                    background: "#0D0D0D",
                                    border: "1px solid #3A3A3A",
                                    color: "#FFFFFF",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "13px",
                                    padding: "12px 16px",
                                    borderRadius: "0px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#0EA5E9"}
                                onBlur={(e) => e.target.style.borderColor = "#3A3A3A"}
                            />
                            {!targetJobTitle.trim() && resumeText.trim() && (
                                <div style={{ color: "#F59E0B", fontSize: "11px", marginTop: "4px" }}>
                                    No job title entered. Analysis will use generic scoring.
                                </div>
                            )}

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                                {["Software Engineer", "Product Manager", "Data Scientist", "ML Engineer", "Prompt Engineer"].map((title) => (
                                    <button
                                        key={title}
                                        onClick={() => handleTitleSuggestionClick(title)}
                                        style={{
                                            background: "#111111",
                                            border: "1px solid #3A3A3A",
                                            color: "#FFFFFF",
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: "10px",
                                            padding: "4px 10px",
                                            borderRadius: "0px",
                                            cursor: "pointer",
                                            transition: "border-color 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0EA5E9"}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#3A3A3A"}
                                    >
                                        {title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div style={{ marginTop: "16px" }}>
                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeText.trim() || isAnalyzing}
                                style={{
                                    width: "100%",
                                    background: (!resumeText.trim() || isAnalyzing) ? "#1A1A1A" : "#0EA5E9",
                                    color: (!resumeText.trim() || isAnalyzing) ? "#444444" : "#000000",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    padding: "14px",
                                    borderRadius: "0px",
                                    letterSpacing: "0.1em",
                                    border: "none",
                                    cursor: (!resumeText.trim() || isAnalyzing) ? "not-allowed" : "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                {isAnalyzing ? (
                                    <span style={{ animation: "pulse 1.5s infinite" }}>ANALYZING...</span>
                                ) : (
                                    "RUN FULL DIAGNOSTIC →"
                                )}
                            </button>
                            <div style={{ color: "#444444", fontSize: "10px", textAlign: "center", marginTop: "12px" }}>
                                8 engines · Results in under 10 seconds · No account required
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ flex: "1 1 38%", minWidth: "300px", display: "flex", flexDirection: "column" }}>

                        {/* What Gets Analyzed card */}
                        <div style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", padding: "24px" }}>
                            <div style={{ color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.1em" }}>
                                WHAT GETS ANALYZED
                            </div>

                            <div style={{ display: "flex", flexDirection: "column" }}>
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
                                    <div key={engine.name} style={{
                                        padding: "12px 0",
                                        borderBottom: i === arr.length - 1 ? "none" : "1px solid #1A1A1A",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px"
                                    }}>
                                        <div style={{ color: "#FFFFFF", fontSize: "11px" }}>{engine.name}</div>
                                        <div style={{ color: "#666666", fontSize: "11px" }}>{engine.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips card */}
                        <div style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", padding: "24px", marginTop: "16px" }}>
                            <div style={{ color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.1em" }}>
                                FOR BEST RESULTS
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", gap: "8px", color: "#666666", fontSize: "11px", lineHeight: "1.5" }}>
                                    <span style={{ color: "#0EA5E9" }}>→</span>
                                    Include your full resume — all sections, not just experience
                                </div>
                                <div style={{ display: "flex", gap: "8px", color: "#666666", fontSize: "11px", lineHeight: "1.5" }}>
                                    <span style={{ color: "#0EA5E9" }}>→</span>
                                    Paste the actual job description if you have one — not just the title
                                </div>
                                <div style={{ display: "flex", gap: "8px", color: "#666666", fontSize: "11px", lineHeight: "1.5" }}>
                                    <span style={{ color: "#0EA5E9" }}>→</span>
                                    Plain text is better than formatted text copied from a PDF
                                </div>
                            </div>
                        </div>

                        {/* Previous Analysis card */}
                        {lastAnalysis && (
                            <div style={{ background: "#0D0D0D", border: "1px solid #2A2A2A", padding: "24px", marginTop: "16px" }}>
                                <div style={{ color: "#0EA5E9", fontSize: "10px", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.1em" }}>
                                    LAST ANALYSIS
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ color: "#FFFFFF", fontSize: "13px", marginBottom: "4px" }}>{lastAnalysis.title}</div>
                                        <div style={{ color: "#666666", fontSize: "11px", fontFeatureSettings: '"zero" 0, "ss01" 0, "ss02" 0', fontVariantNumeric: "normal" }}>{lastAnalysis.date} • Score: {lastAnalysis.score}</div>
                                    </div>
                                    <button
                                        onClick={() => navigate("/results")}
                                        style={{ background: "transparent", border: "none", color: "#0EA5E9", fontSize: "11px", cursor: "pointer", padding: 0, fontFamily: "'DM Mono', monospace" }}
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

