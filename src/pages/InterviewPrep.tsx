import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { generateInterviewQuestions } from "@/lib/integrations/geminiClient";
import { safeStorage } from "@/lib/storage-safe";
import { toast } from "sonner";

const DIFFICULTY_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  situational: "Situational",
};

function categorizeDifficulty(q: string): string {
  const lower = q.toLowerCase();
  if (
    lower.startsWith("tell me about") ||
    lower.startsWith("describe a time") ||
    lower.startsWith("give me an example") ||
    lower.startsWith("how did you handle") ||
    lower.startsWith("what was a challenge")
  ) {
    return "behavioral";
  }
  if (
    lower.includes("explain") ||
    lower.includes("implement") ||
    lower.includes("algorithm") ||
    lower.includes("design") ||
    lower.includes("difference between") ||
    lower.includes("what is") ||
    lower.includes("how does") ||
    lower.includes("debug") ||
    lower.includes("optimize")
  ) {
    return "technical";
  }
  return "situational";
}

export default function InterviewPrep() {
  const [targetRole, setTargetRole] = useState("");
  const [missingSkillsText, setMissingSkillsText] = useState("");
  const [existingSkillsText, setExistingSkillsText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Pre-populate from stored analysis result
  useEffect(() => {
    const raw = safeStorage.getItem("resumeAnalysis");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);

      const topRole: string =
        (data.roles?.topRoles?.[0] as { role?: string; occupation?: { title?: string } })
          ?.occupation?.title ||
        (data.roles?.topRoles?.[0] as { role?: string })?.role ||
        "";
      if (topRole) setTargetRole(topRole);

      const rawSkills = data.parsedProfile?.skills;
      let existing: string[] = [];
      if (Array.isArray(rawSkills)) {
        existing = rawSkills as string[];
      } else if (rawSkills?.normalizedSkills) {
        existing = (rawSkills.normalizedSkills as { canonical: string }[]).map(
          (s) => s.canonical
        );
      }
      if (existing.length > 0) setExistingSkillsText(existing.slice(0, 15).join(", "));

      const gapItems = data.gaps?.genuineGaps ?? [];
      const missing: string[] = gapItems
        .slice(0, 8)
        .map((g: string | { keyword?: string }) =>
          typeof g === "string" ? g : (g.keyword ?? "")
        )
        .filter(Boolean);
      if (missing.length > 0) setMissingSkillsText(missing.join(", "));

      if (topRole || existing.length > 0 || missing.length > 0) setPrefilled(true);
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role.");
      return;
    }

    const missingSkills = missingSkillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const existingSkills = existingSkillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsGenerating(true);
    setQuestions([]);
    setApiKeyMissing(false);

    try {
      const result = await generateInterviewQuestions(
        targetRole,
        missingSkills,
        existingSkills
      );
      if (result.length === 0) {
        toast.error("No questions generated. Try adjusting your inputs.");
      } else {
        setQuestions(result);
        toast.success(`${result.length} questions generated.`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("API key not configured")) {
        setApiKeyMissing(true);
      } else {
        toast.error("Generation failed: " + msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Questions copied to clipboard."));
  };

  return (
    <DashboardLayout>
      <div
        className="max-w-[900px] mx-auto px-6 pb-20 font-mono"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {/* Header */}
        <div className="mb-10 pt-6">
          <div
            style={{
              fontFamily: "inherit",
              fontSize: "10px",
              color: "#0EA5E9",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "12px",
            }}
          >
            AI INTERVIEW PREP
          </div>
          <h1
            style={{
              fontFamily: "inherit",
              fontSize: "32px",
              color: "#FFFFFF",
              fontWeight: "normal",
              margin: "0 0 8px 0",
            }}
          >
            Interview Question Generator
          </h1>
          <p style={{ fontFamily: "inherit", fontSize: "13px", color: "#888888", margin: 0 }}>
            Generate 10 targeted interview questions based on your skill gaps and target role.
            {prefilled && (
              <span style={{ color: "#10B981", marginLeft: "8px" }}>
                ✓ Pre-filled from your last analysis.
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Left — inputs */}
          <div style={{ flex: "1 1 55%", minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Target Role */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                }}
              >
                TARGET ROLE
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Data Scientist, Product Manager"
                style={{
                  width: "100%",
                  background: "#0D0D0D",
                  border: "1px solid #3A3A3A",
                  color: "#F0F0F0",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "#3A3A3A")}
              />
              {/* Quick picks */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {[
                  "Software Engineer",
                  "ML Engineer",
                  "Data Scientist",
                  "Product Manager",
                  "DevOps Engineer",
                ].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTargetRole(r)}
                    style={{
                      background: "#111111",
                      border: "1px solid #2A2A2A",
                      color: "#AAAAAA",
                      fontFamily: "inherit",
                      fontSize: "10px",
                      padding: "4px 10px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0EA5E9")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                }}
              >
                SKILL GAPS{" "}
                <span style={{ color: "#444444", textTransform: "none", letterSpacing: 0 }}>
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={missingSkillsText}
                onChange={(e) => setMissingSkillsText(e.target.value)}
                placeholder="e.g. Kubernetes, System Design, LangChain, AWS Lambda"
                style={{
                  width: "100%",
                  background: "#0D0D0D",
                  border: "1px solid #3A3A3A",
                  color: "#F0F0F0",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "#3A3A3A")}
              />
            </div>

            {/* Existing skills */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "8px",
                }}
              >
                YOUR SKILLS{" "}
                <span style={{ color: "#444444", textTransform: "none", letterSpacing: 0 }}>
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={existingSkillsText}
                onChange={(e) => setExistingSkillsText(e.target.value)}
                placeholder="e.g. Python, React, TypeScript, PostgreSQL, Docker"
                style={{
                  width: "100%",
                  background: "#0D0D0D",
                  border: "1px solid #3A3A3A",
                  color: "#F0F0F0",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "#3A3A3A")}
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !targetRole.trim()}
              style={{
                background: isGenerating || !targetRole.trim() ? "#1A1A1A" : "#0EA5E9",
                color: isGenerating || !targetRole.trim() ? "#444444" : "#000000",
                border: "none",
                fontFamily: "inherit",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "14px",
                cursor: isGenerating || !targetRole.trim() ? "not-allowed" : "pointer",
                fontWeight: "bold",
                width: "100%",
                transition: "background 150ms",
              }}
            >
              {isGenerating ? "GENERATING..." : "✦ GENERATE 10 INTERVIEW QUESTIONS"}
            </button>

            {/* API key missing notice */}
            {apiKeyMissing && (
              <div
                style={{
                  background: "#1A0000",
                  border: "1px solid #EF4444",
                  padding: "16px",
                  fontFamily: "inherit",
                  fontSize: "11px",
                  color: "#FCA5A5",
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: "#EF4444" }}>Gemini API key not configured.</strong>
                <br />
                Add <code style={{ background: "#2A0000", padding: "1px 4px" }}>VITE_GEMINI_API_KEY</code> to
                your <code style={{ background: "#2A0000", padding: "1px 4px" }}>.env</code> file to
                enable AI-powered question generation.
              </div>
            )}
          </div>

          {/* Right — tips */}
          <div style={{ flex: "1 1 38%", minWidth: "240px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #2A2A2A",
                padding: "24px",
              }}
            >
              <div
                style={{
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "16px",
                }}
              >
                HOW IT WORKS
              </div>
              {[
                { label: "01", text: "Enter your target role and skill gaps" },
                { label: "02", text: "Gemini AI crafts 10 targeted questions" },
                { label: "03", text: "Mix of behavioral, technical, and situational" },
                { label: "04", text: "Questions probe gaps while validating strengths" },
              ].map((step) => (
                <div
                  key={step.label}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "inherit",
                      fontSize: "10px",
                      color: "#444444",
                      minWidth: "20px",
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "inherit",
                      fontSize: "11px",
                      color: "#888888",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #2A2A2A",
                padding: "24px",
              }}
            >
              <div
                style={{
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#0EA5E9",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "16px",
                }}
              >
                TIP
              </div>
              <p style={{ fontFamily: "inherit", fontSize: "11px", color: "#888888", lineHeight: 1.7, margin: 0 }}>
                Run a full resume analysis first — the skill gaps and target role will be
                auto-detected and pre-filled here.
              </p>
            </div>
          </div>
        </div>

        {/* Questions output */}
        {questions.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "inherit",
                    fontSize: "10px",
                    color: "#0EA5E9",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "4px",
                  }}
                >
                  GENERATED QUESTIONS
                </div>
                <div style={{ fontFamily: "inherit", fontSize: "13px", color: "#888888" }}>
                  {questions.length} questions for <strong style={{ color: "#FFFFFF" }}>{targetRole}</strong>
                </div>
              </div>
              <button
                onClick={handleCopyAll}
                style={{
                  background: "none",
                  border: "1px solid #3A3A3A",
                  color: "#AAAAAA",
                  fontFamily: "inherit",
                  fontSize: "10px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0EA5E9")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3A3A3A")}
              >
                COPY ALL
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {questions.map((q, i) => {
                const category = categorizeDifficulty(q);
                const categoryColor =
                  category === "technical"
                    ? "#0EA5E9"
                    : category === "behavioral"
                    ? "#10B981"
                    : "#F59E0B";
                return (
                  <div
                    key={i}
                    style={{
                      background: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      borderLeft: `4px solid ${categoryColor}`,
                      padding: "16px 20px",
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "inherit",
                        fontSize: "20px",
                        color: "#333333",
                        minWidth: "28px",
                        lineHeight: 1.4,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "inherit",
                          fontSize: "13px",
                          color: "#F0F0F0",
                          margin: "0 0 8px 0",
                          lineHeight: 1.6,
                        }}
                      >
                        {q}
                      </p>
                      <span
                        style={{
                          fontFamily: "inherit",
                          fontSize: "9px",
                          color: categoryColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          border: `1px solid ${categoryColor}`,
                          padding: "2px 6px",
                        }}
                      >
                        {DIFFICULTY_LABELS[category]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                background: "#060606",
                border: "1px solid #1A1A1A",
                fontFamily: "inherit",
                fontSize: "11px",
                color: "#555555",
                lineHeight: 1.7,
              }}
            >
              Questions are AI-generated by Google Gemini. Review each question before your
              interview. Run a fresh generation to get alternative question sets.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
