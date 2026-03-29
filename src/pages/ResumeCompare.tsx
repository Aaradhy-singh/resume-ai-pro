import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { type AnalysisResult } from "@/lib/engines/analysis-orchestrator";
import { parseResume, validateResumeFile, type ParsedResume } from "@/lib/parsers/resumeParser";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────

function getOverallScore(result: AnalysisResult): number {
  return result.scores?.keywordCoverage?.overallScore ?? 0;
}

function getCareerStage(result: AnalysisResult): string {
  return (result.careerStage?.stage as string) ?? "Unknown";
}

function getSkillCount(result: AnalysisResult): number {
  return result.parsedProfile?.skills?.normalizedSkills?.length ?? 0;
}

function getTopRole(result: AnalysisResult): string {
  const r = result.roles?.topRoles?.[0];
  return (r as { occupation?: { title?: string }; role?: string })?.occupation?.title ??
    (r as { role?: string })?.role ??
    "—";
}

function getATSScore(result: AnalysisResult): number {
  return result.scores?.keywordCoverage?.overallScore ?? 0;
}

function getFormatScore(result: AnalysisResult): number {
  return result.scores?.format?.parsingReliabilityScore ?? 0;
}

function getBulletGrade(result: AnalysisResult): string {
  return result.specificityReport?.overallGrade ?? "—";
}

function getRecommendationCount(result: AnalysisResult): number {
  return result.recommendations?.length ?? 0;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function deltaBadge(a: number, b: number) {
  const d = a - b;
  if (d === 0) return null;
  const sign = d > 0 ? "+" : "";
  const col = d > 0 ? "#10B981" : "#EF4444";
  return (
    <span
      style={{
        fontFamily: "inherit",
        fontSize: "10px",
        color: col,
        marginLeft: "8px",
        border: `1px solid ${col}`,
        padding: "1px 5px",
      }}
    >
      {sign}
      {d}
    </span>
  );
}

// ── file drop zone ────────────────────────────────────────────────────────────

interface DropZoneProps {
  label: string;
  onParsed: (parsed: ParsedResume) => void;
  parsed: ParsedResume | null;
}

function DropZone({ label, onParsed, parsed }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const validation = validateResumeFile(file);
        if (!validation.valid) {
          toast.error(validation.error ?? "Invalid file.");
          return;
        }
        const result = await parseResume(file);
        onParsed(result);
        toast.success(`${label} parsed — ${result.rawText.split(/\s+/).length} words extracted.`);
      } catch (e) {
        toast.error("Parse failed: " + (e instanceof Error ? e.message : "Unknown error"));
      } finally {
        setIsProcessing(false);
      }
    },
    [label, onParsed]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const border = parsed
    ? "1px solid #10B981"
    : isDragging
    ? "1px solid #0EA5E9"
    : "1px dashed #3A3A3A";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        flex: "1 1 45%",
        minWidth: "260px",
        background: "#0D0D0D",
        border,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "border-color 150ms",
        minHeight: "180px",
        position: "relative",
      }}
      onClick={() => document.getElementById(`file-input-${label}`)?.click()}
    >
      <input
        id={`file-input-${label}`}
        type="file"
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {isProcessing ? (
        <div
          style={{
            fontFamily: "inherit",
            fontSize: "12px",
            color: "#0EA5E9",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          PARSING...
        </div>
      ) : parsed ? (
        <>
          <div style={{ fontFamily: "inherit", fontSize: "20px", color: "#10B981" }}>✓</div>
          <div
            style={{
              fontFamily: "inherit",
              fontSize: "11px",
              color: "#10B981",
              textAlign: "center",
            }}
          >
            {parsed.metadata.fileName}
          </div>
          <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#555555" }}>
            {parsed.rawText.split(/\s+/).length} words · click to replace
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "inherit", fontSize: "28px", color: "#3A3A3A" }}>↑</div>
          <div
            style={{
              fontFamily: "inherit",
              fontSize: "10px",
              color: "#888888",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textAlign: "center",
            }}
          >
            {label}
          </div>
          <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#555555", textAlign: "center" }}>
            Drop PDF or DOCX here, or click to browse
          </div>
        </>
      )}
    </div>
  );
}

// ── comparison row ────────────────────────────────────────────────────────────

interface CompareRowProps {
  label: string;
  a: number | string;
  b: number | string;
  isScore?: boolean;
  higherIsBetter?: boolean;
}

function CompareRow({ label, a, b, isScore = true, higherIsBetter = true }: CompareRowProps) {
  const aNum = typeof a === "number" ? a : null;
  const bNum = typeof b === "number" ? b : null;

  let aWinner = false;
  let bWinner = false;
  if (aNum !== null && bNum !== null && aNum !== bNum) {
    aWinner = higherIsBetter ? aNum > bNum : aNum < bNum;
    bWinner = !aWinner;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid #1A1A1A",
      }}
    >
      {/* Resume A value */}
      <div style={{ textAlign: "right" }}>
        <span
          style={{
            fontFamily: "inherit",
            fontSize: "14px",
            color: isScore && aNum !== null ? scoreColor(aNum) : "#F0F0F0",
            fontWeight: aWinner ? "bold" : "normal",
          }}
        >
          {a}
          {aWinner && (
            <span style={{ marginLeft: "6px", fontSize: "10px", color: "#10B981" }}>★</span>
          )}
        </span>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <span
          style={{
            fontFamily: "inherit",
            fontSize: "10px",
            color: "#555555",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>

      {/* Resume B value */}
      <div style={{ textAlign: "left" }}>
        <span
          style={{
            fontFamily: "inherit",
            fontSize: "14px",
            color: isScore && bNum !== null ? scoreColor(bNum) : "#F0F0F0",
            fontWeight: bWinner ? "bold" : "normal",
          }}
        >
          {bWinner && (
            <span style={{ marginRight: "6px", fontSize: "10px", color: "#10B981" }}>★</span>
          )}
          {b}
        </span>
      </div>
    </div>
  );
}

// ── bar comparison ────────────────────────────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "6px",
        background: "#1A1A1A",
        marginTop: "6px",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, score))}%`,
          height: "100%",
          background: color,
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ResumeCompare() {
  const [parsedA, setParsedA] = useState<ParsedResume | null>(null);
  const [parsedB, setParsedB] = useState<ParsedResume | null>(null);
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canAnalyze = parsedA !== null && parsedB !== null && !isAnalyzing;

  const handleCompare = async () => {
    if (!parsedA || !parsedB) return;
    setIsAnalyzing(true);
    setResultA(null);
    setResultB(null);
    try {
      const { analyzeResume } = await import("@/lib/engines/analysis-orchestrator");
      toast.info("Analyzing both resumes in parallel…");
      const [rA, rB] = await Promise.all([
        analyzeResume(parsedA),
        analyzeResume(parsedB),
      ]);
      setResultA(rA);
      setResultB(rB);
      toast.success("Comparison complete.");
    } catch (e) {
      toast.error("Analysis failed: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreA = resultA ? getOverallScore(resultA) : null;
  const scoreB = resultB ? getOverallScore(resultB) : null;
  const winner =
    scoreA !== null && scoreB !== null
      ? scoreA > scoreB
        ? "A"
        : scoreB > scoreA
        ? "B"
        : "TIE"
      : null;

  return (
    <DashboardLayout>
      <div
        style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 24px 80px", fontFamily: "'DM Mono', monospace" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
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
            RESUME COMPARE
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
            Side-by-Side Score Comparison
          </h1>
          <p style={{ fontFamily: "inherit", fontSize: "13px", color: "#888888", margin: 0 }}>
            Upload two versions of your resume to see which performs better across all 8 diagnostic
            engines.
          </p>
        </div>

        {/* Upload zones */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <DropZone label="RESUME A" onParsed={setParsedA} parsed={parsedA} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333333",
              fontSize: "18px",
              fontFamily: "inherit",
              minWidth: "30px",
            }}
          >
            VS
          </div>
          <DropZone label="RESUME B" onParsed={setParsedB} parsed={parsedB} />
        </div>

        {/* Compare button */}
        <button
          onClick={handleCompare}
          disabled={!canAnalyze}
          style={{
            width: "100%",
            background: canAnalyze ? "#0EA5E9" : "#1A1A1A",
            color: canAnalyze ? "#000000" : "#444444",
            border: "none",
            fontFamily: "inherit",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            padding: "14px",
            cursor: canAnalyze ? "pointer" : "not-allowed",
            fontWeight: "bold",
            marginBottom: "40px",
            transition: "background 150ms",
          }}
        >
          {isAnalyzing ? "ANALYZING BOTH RESUMES..." : "COMPARE RESUMES →"}
        </button>

        {/* Results */}
        {resultA && resultB && (
          <div>
            {/* Winner banner */}
            {winner && (
              <div
                style={{
                  background: winner === "TIE" ? "#111111" : "#0A1A0A",
                  border: `1px solid ${winner === "TIE" ? "#333333" : "#10B981"}`,
                  padding: "20px 24px",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={{ fontFamily: "inherit", fontSize: "28px" }}>
                  {winner === "TIE" ? "🤝" : "🏆"}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "inherit",
                      fontSize: "10px",
                      color: "#10B981",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      marginBottom: "4px",
                    }}
                  >
                    VERDICT
                  </div>
                  {winner === "TIE" ? (
                    <div style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF" }}>
                      Both resumes score equally.
                    </div>
                  ) : (
                    <div style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF" }}>
                      <strong style={{ color: "#10B981" }}>Resume {winner}</strong> scores higher
                      {scoreA !== null && scoreB !== null && (
                        <span style={{ color: "#888888" }}>
                          {" "}
                          by {Math.abs(scoreA - scoreB)} points (
                          {scoreA > scoreB ? scoreA : scoreB} vs{" "}
                          {scoreA > scoreB ? scoreB : scoreA})
                        </span>
                      )}
                      .
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "12px",
                marginBottom: "8px",
                padding: "0 0 12px",
                borderBottom: "1px solid #2A2A2A",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontFamily: "inherit",
                    fontSize: "10px",
                    color: "#0EA5E9",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  RESUME A
                </span>
                <div
                  style={{
                    fontFamily: "inherit",
                    fontSize: "9px",
                    color: "#555555",
                    marginTop: "2px",
                  }}
                >
                  {parsedA?.metadata.fileName}
                </div>
              </div>
              <div />
              <div style={{ textAlign: "left" }}>
                <span
                  style={{
                    fontFamily: "inherit",
                    fontSize: "10px",
                    color: "#0EA5E9",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  RESUME B
                </span>
                <div
                  style={{
                    fontFamily: "inherit",
                    fontSize: "9px",
                    color: "#555555",
                    marginTop: "2px",
                  }}
                >
                  {parsedB?.metadata.fileName}
                </div>
              </div>
            </div>

            {/* Score bars */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "12px",
                marginBottom: "32px",
                padding: "24px 0",
                borderBottom: "1px solid #1A1A1A",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontFamily: "inherit",
                    fontSize: "32px",
                    color: scoreColor(scoreA!),
                    fontWeight: winner === "A" ? "bold" : "normal",
                  }}
                >
                  {scoreA}
                </span>
                <ScoreBar score={scoreA!} color={scoreColor(scoreA!)} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#444444",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}
              >
                OVERALL
                {deltaBadge(scoreA!, scoreB!)}
              </div>
              <div style={{ textAlign: "left" }}>
                <span
                  style={{
                    fontFamily: "inherit",
                    fontSize: "32px",
                    color: scoreColor(scoreB!),
                    fontWeight: winner === "B" ? "bold" : "normal",
                  }}
                >
                  {scoreB}
                </span>
                <ScoreBar score={scoreB!} color={scoreColor(scoreB!)} />
              </div>
            </div>

            {/* Detailed comparison rows */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontFamily: "inherit",
                  fontSize: "10px",
                  color: "#555555",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "16px",
                }}
              >
                DETAILED BREAKDOWN
              </div>

              <CompareRow
                label="ATS Score"
                a={getATSScore(resultA)}
                b={getATSScore(resultB)}
              />
              <CompareRow
                label="Skills Detected"
                a={getSkillCount(resultA)}
                b={getSkillCount(resultB)}
              />
              <CompareRow
                label="Format Score"
                a={getFormatScore(resultA)}
                b={getFormatScore(resultB)}
              />
              <CompareRow
                label="Bullet Grade"
                a={getBulletGrade(resultA)}
                b={getBulletGrade(resultB)}
                isScore={false}
              />
              <CompareRow
                label="Recommendations"
                a={getRecommendationCount(resultA)}
                b={getRecommendationCount(resultB)}
                higherIsBetter={false}
              />
              <CompareRow
                label="Career Stage"
                a={getCareerStage(resultA)}
                b={getCareerStage(resultB)}
                isScore={false}
              />
              <CompareRow
                label="Top Role Match"
                a={getTopRole(resultA)}
                b={getTopRole(resultB)}
                isScore={false}
              />
            </div>

            {/* Skills comparison */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "RESUME A SKILLS", result: resultA, color: "#0EA5E9" },
                { label: "RESUME B SKILLS", result: resultB, color: "#0EA5E9" },
              ].map(({ label, result, color }) => {
                const rawSkills = result.parsedProfile?.skills;
                const skills: string[] = Array.isArray(rawSkills)
                  ? (rawSkills as string[])
                  : (rawSkills?.normalizedSkills ?? []).map(
                      (s: { canonical: string }) => s.canonical
                    );
                const skillsA =
                  resultA.parsedProfile?.skills?.normalizedSkills?.map(
                    (s) => s.canonical
                  ) ?? [];
                const skillsB =
                  resultB.parsedProfile?.skills?.normalizedSkills?.map(
                    (s) => s.canonical
                  ) ?? [];
                const isA = label.includes("A");
                const unique = isA
                  ? skills.filter((s) => !skillsB.includes(s))
                  : skills.filter((s) => !skillsA.includes(s));

                return (
                  <div
                    key={label}
                    style={{
                      flex: "1 1 45%",
                      minWidth: "240px",
                      background: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "inherit",
                        fontSize: "10px",
                        color,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginBottom: "12px",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {skills.slice(0, 20).map((skill) => {
                        const isUnique = unique.includes(skill);
                        return (
                          <span
                            key={skill}
                            style={{
                              fontFamily: "inherit",
                              fontSize: "10px",
                              color: isUnique ? "#10B981" : "#888888",
                              border: `1px solid ${isUnique ? "#10B981" : "#2A2A2A"}`,
                              padding: "2px 8px",
                              background: isUnique ? "#0A1A0A" : "transparent",
                            }}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                    {unique.length > 0 && (
                      <div
                        style={{
                          fontFamily: "inherit",
                          fontSize: "10px",
                          color: "#10B981",
                          marginTop: "10px",
                        }}
                      >
                        ★ {unique.length} unique skill{unique.length !== 1 ? "s" : ""} not in the
                        other resume
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommendations comparison */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "RESUME A — TOP FIXES", result: resultA },
                { label: "RESUME B — TOP FIXES", result: resultB },
              ].map(({ label, result }) => {
                const recs = result.recommendations.slice(0, 4);
                return (
                  <div
                    key={label}
                    style={{
                      flex: "1 1 45%",
                      minWidth: "240px",
                      background: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "inherit",
                        fontSize: "10px",
                        color: "#0EA5E9",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginBottom: "12px",
                      }}
                    >
                      {label}
                    </div>
                    {recs.length === 0 ? (
                      <div
                        style={{ fontFamily: "inherit", fontSize: "11px", color: "#555555" }}
                      >
                        No recommendations generated.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {recs.map((r, i) => {
                          const priorityColor =
                            r.priorityLevel === "critical"
                              ? "#EF4444"
                              : r.priorityLevel === "high"
                              ? "#F59E0B"
                              : "#888888";
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "inherit",
                                  fontSize: "9px",
                                  color: priorityColor,
                                  border: `1px solid ${priorityColor}`,
                                  padding: "1px 5px",
                                  whiteSpace: "nowrap",
                                  textTransform: "uppercase",
                                }}
                              >
                                {r.priorityLevel}
                              </span>
                              <span
                                style={{
                                  fontFamily: "inherit",
                                  fontSize: "11px",
                                  color: "#CCCCCC",
                                  lineHeight: 1.5,
                                }}
                              >
                                {r.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
