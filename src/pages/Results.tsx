import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type AnalysisResult } from "@/lib/engines/analysis-orchestrator";
import { FeedbackModal } from '@/components/FeedbackModal';
import { ShareModal } from "@/components/results/ShareModal";

import { safeStorage } from "@/lib/storage-safe";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import posthog from 'posthog-js';

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "SKILL GAPS" | "ATS" | "IMPACT" | "KEYWORDS" | "EXPERIENCE" | "EDUCATION" | "PORTFOLIO"
  >("OVERVIEW");
  const [showFeedback, setShowFeedback] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scoreDetailsOpen, setScoreDetailsOpen] = useState(false);


  useEffect(() => {
    try {
      const storedData = safeStorage.getItem("resumeAnalysis");
      if (!storedData) {
        navigate('/upload');
        return;
      }
      const parsed: AnalysisResult = JSON.parse(storedData);
      if (!parsed.careerStage || !parsed.scores) {
        throw new Error("Invalid analysis data format");
      }
      setData(parsed);
    } catch (error) {
      console.error("Failed to load results:", error);
      navigate('/upload');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // FIX 2: Real export logic (ported from ResultsHeader.tsx)
  const handleExport = () => {
    if (!data) return;
    posthog.capture('pdf_exported', { page: 'results' });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const hex = (h: string) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });

    const checkPage = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        doc.setFillColor(255,255,255);
        doc.rect(0,0,pageWidth,pageHeight,'F');
        y = margin + 6;
      }
    };

    const setFont = (size: number, style: 'normal'|'bold', colorHex: string) => {
      const c = hex(colorHex);
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(c.r, c.g, c.b);
    };

    const drawRect = (x: number, rectY: number, w: number, h: number, fillHex: string) => {
      const c = hex(fillHex);
      doc.setFillColor(c.r, c.g, c.b);
      doc.rect(x, rectY, w, h, 'F');
    };

    const hRule = (colorHex = '#CCCCCC') => {
      const c = hex(colorHex);
      doc.setDrawColor(c.r, c.g, c.b);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    };

    const sectionHeader = (label: string, number: string) => {
      checkPage(14);
      drawRect(margin, y, contentWidth, 9, '#0F172A');
      const ac = hex('#0EA5E9');
      doc.setFontSize(8);
      doc.setFont('helvetica','bold');
      doc.setTextColor(ac.r, ac.g, ac.b);
      doc.text(number, margin + 3, y + 6);
      const wc = hex('#FFFFFF');
      doc.setTextColor(wc.r, wc.g, wc.b);
      doc.text(label.toUpperCase(), margin + 14, y + 6);
      y += 13;
    };

    const row = (label: string, value: string, valueColorHex = '#1A1A1A') => {
      checkPage(8);
      setFont(8, 'bold', '#555555');
      doc.text(label.toUpperCase(), margin, y);
      setFont(8, 'normal', valueColorHex);
      const lines = doc.splitTextToSize(value, contentWidth - 52);
      doc.text(lines[0] ?? '', margin + 48, y);
      y += 6;
      for (let i = 1; i < lines.length; i++) {
        checkPage(6);
        setFont(8, 'normal', valueColorHex);
        doc.text(lines[i], margin + 48, y);
        y += 5.5;
      }
    };

    const bodyText = (text: string, colorHex = '#1A1A1A', size = 8) => {
      checkPage(7);
      setFont(size, 'normal', colorHex);
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        checkPage(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
    };

    const bullet = (text: string, colorHex = '#1A1A1A') => {
      checkPage(7);
      setFont(8, 'bold', '#0EA5E9');
      doc.text('•', margin, y);
      setFont(8, 'normal', colorHex);
      const lines = doc.splitTextToSize(text, contentWidth - 6);
      lines.forEach((line: string, i: number) => {
        checkPage(6);
        doc.text(line, margin + 5, y);
        if (i < lines.length - 1) y += 5;
      });
      y += 6;
    };

    // ── COVER PAGE ──
    doc.setFillColor(255,255,255);
    doc.rect(0,0,pageWidth,pageHeight,'F');
    drawRect(0, 0, pageWidth, 55, '#0F172A');

    setFont(22, 'bold', '#0EA5E9');
    doc.text('RESUME ANALYSIS', margin, 22);
    setFont(22, 'normal', '#FFFFFF');
    doc.text('REPORT', margin, 33);
    setFont(8, 'normal', '#94A3B8');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB',{ year:'numeric', month:'long', day:'numeric' })}`, margin, 43);
    doc.text('ResumeAI Pro — Resume Analysis Intelligence', margin, 49);

    // Score box
    y = 65;
    const engineScoreList = [
      { n: 'ATS Score', s: data?.scores?.format?.parsingReliabilityScore ?? 65 },
      { n: 'Skill Match', s: data?.roles?.topRoles?.[0]?.matchScore ?? 45 },
      { n: 'Impact Score', s: data?.specificityReport?.averageScore ? Math.round(data.specificityReport.averageScore * 20) : 50 },
      { n: 'Keywords', s: data?.scores?.keywordCoverage?.overallScore ?? -1 },
      { n: 'Experience', s: (() => { const years = data?.careerStage?.signals?.totalExperienceYears ?? 0; const stage = data?.careerStage?.stage; if (stage === 'student') return Math.round(Math.min(60, 30 + (data?.projectComplexity?.overallScore ?? 0) * 0.3)); return Math.round(Math.min(100, 40 + years * 8)); })() },
      { n: 'Education', s: Math.round(Math.min(70, 40 + (data?.careerStage?.signals?.certificationCount ?? 0) * 5)) },
      { n: 'Portfolio', s: data?.scores?.portfolio?.portfolioScore ?? 0 },
      { n: 'Trajectory', s: data?.projectComplexity?.overallScore ?? 55 },
    ];
    const scored = engineScoreList.filter(e => e.s !== -1);
    const avg = Math.round(scored.reduce((s,e) => s+e.s, 0) / scored.length);
    const overall = avg;
    const scoreColor = overall >= 70 ? '#10B981' : overall >= 40 ? '#F59E0B' : '#EF4444';

    // Overall score box
    drawRect(margin, y, 52, 30, '#F8FAFC');
    const sc = hex(scoreColor);
    doc.setFontSize(26);
    doc.setFont('helvetica','bold');
    doc.setTextColor(sc.r, sc.g, sc.b);
    doc.text(`${overall}`, margin + 5, y + 18);
    setFont(9, 'normal', '#555555');
    doc.text('/100', margin + 28, y + 18);
    setFont(7, 'normal', '#888888');
    doc.text('OVERALL SCORE', margin + 4, y + 26);

    // Engine scores in 2x4 grid
    const gridStartX = margin + 58;
    const colWidth = (contentWidth - 58) / 4;
    engineScoreList.forEach((e, i) => {
      const col = i % 4;
      const row2 = Math.floor(i / 4);
      const ex = gridStartX + col * colWidth;
      const ey = y + row2 * 14 + 6;
      const ec = e.s === -1 ? '#AAAAAA' : e.s >= 70 ? '#10B981' : e.s >= 40 ? '#F59E0B' : '#EF4444';
      setFont(7, 'bold', '#333333');
      doc.text(e.n.toUpperCase(), ex, ey);
      setFont(9, 'bold', ec);
      doc.text(e.s === -1 ? 'N/A' : `${e.s}%`, ex, ey + 7);
    });

    y = 105;
    hRule('#DDDDDD');

    // ── SECTION 1 — CAREER STAGE ──
    sectionHeader('Career Stage & Profile', '01');
    const stage = data?.careerStage;
    if (stage) {
      row('Stage', stage.stage?.toUpperCase() ?? 'Unknown');
      row('Confidence', `${stage.confidence ?? 0}%`);
      row('Reasoning', stage.reasoning ?? 'N/A');
      if (stage.signals?.certificationCount) row('Certifications', String(stage.signals.certificationCount));
      if (stage.signals?.totalExperienceYears) row('Experience', `${stage.signals.totalExperienceYears} years`);
      if (stage.signals?.projectCount) row('Projects Detected', String(stage.signals.projectCount));
    }
    y += 4;

    // ── SECTION 2 — TOP ROLE MATCH ──
    sectionHeader('Top Role Match', '02');
    const top = data?.roles?.topRoles?.[0];
    if (top) {
      row('Role', top.occupation?.title ?? 'N/A');
      row('Overall Fit', `${top.matchScore ?? 0}%`, top.matchScore >= 70 ? '#10B981' : top.matchScore >= 40 ? '#F59E0B' : '#EF4444');
      row('Core Skill Match', `${top.matchScore ?? 0}%`);
      const expScore = (() => { const years = data?.careerStage?.signals?.totalExperienceYears ?? 0; const s = data?.careerStage?.stage; if (s === 'student') return Math.round(Math.min(60, 30 + (data?.projectComplexity?.overallScore ?? 0) * 0.3)); return Math.round(Math.min(100, 40 + years * 8)); })();
      row('Experience Fit', `${expScore}%`);
      const certScore = Math.round(Math.min(70, 40 + (data?.careerStage?.signals?.certificationCount ?? 0) * 5));
      row('Certification Fit', `${certScore}%`);
      if (top.missingCrucialSkills?.length > 0) {
        y += 3;
        setFont(8, 'bold', '#EF4444');
        doc.text('CRITICAL MISSING SKILLS:', margin, y);
        y += 6;
        top.missingCrucialSkills.slice(0,5).forEach((s: string) => bullet(s, '#CC2222'));
      }
    }
    y += 4;

    // ── SECTION 3 — KEYWORD GAPS ──
    sectionHeader('Keyword Gap Analysis', '03');
    const hasJD = !!data?.scores?.keywordCoverage;
    if (!hasJD) {
      bodyText('No job description provided. Paste a JD on the Analyze page to unlock keyword alignment scoring.', '#555555');
    } else {
      const genuine = data?.gaps?.genuineGaps ?? [];
      const mention = data?.gaps?.mentionGaps ?? [];
      row('JD Alignment Score', `${data?.scores?.keywordCoverage?.overallScore ?? 0}%`, scoreColor);
      y += 2;
      if (genuine.length > 0) {
        setFont(8, 'bold', '#CC2222');
        doc.text(`GENUINE GAPS (${genuine.length} skills to learn):`, margin, y);
        y += 6;
        genuine.slice(0,8).forEach((g: any) => bullet(g.keyword || g, '#CC2222'));
      }
      if (mention.length > 0) {
        checkPage(10);
        setFont(8, 'bold', '#B45309');
        doc.text(`MENTION GAPS (${mention.length} skills to add to resume):`, margin, y);
        y += 6;
        mention.slice(0,8).forEach((g: any) => bullet(g.keyword || g, '#B45309'));
      }
      if (genuine.length === 0 && mention.length === 0) {
        const jdScore = data?.scores?.keywordCoverage?.overallScore ?? 0;
        if (jdScore < 60) {
          bodyText(`JD alignment score is ${jdScore}%. The keyword gap engine did not detect specific missing skills but your overall alignment is below threshold. Review the JD manually for domain-specific terminology.`, '#F59E0B');
        } else {
          bodyText('No significant keyword gaps detected. Your resume aligns well with the job description.', '#10B981');
        }
      }

    }
    y += 4;

    // ── SECTION 4 — IMPACT SCORING ──
    sectionHeader('Bullet Impact Scoring', '04');
    const spec = data?.specificityReport;
    if (spec) {
      row('Grade', spec.overallGrade ?? 'F', spec.overallGrade === 'A' || spec.overallGrade === 'B' ? '#10B981' : spec.overallGrade === 'C' ? '#F59E0B' : '#EF4444');
      row('Average Score', `${spec.averageScore ?? 0} / 5`);
      row('Total Bullets', String(spec.bullets?.length ?? 0));
      row('Strong Bullets', String(spec.strongBullets?.length ?? 0), '#10B981');
      row('Weak Bullets', String(spec.weakBullets?.length ?? 0), '#EF4444');
      const dist = spec.distribution;
      if (dist) {
        y += 2;
        bodyText(`Score breakdown: ${dist[1] ?? 0} vague, ${dist[2] ?? 0} generic, ${dist[3] ?? 0} named-tech, ${dist[4] ?? 0} outcome-linked, ${dist[5] ?? 0} specific`, '#555555', 7);
      }
      if (spec.weakBullets?.length > 0) {
        y += 3;
        setFont(8, 'bold', '#B45309');
        doc.text('WEAKEST BULLETS TO REWRITE:', margin, y);
        y += 6;
        spec.weakBullets.slice(0,4).forEach((b: any) => {
          const truncated = b.text?.length > 120 ? b.text.slice(0, 117) + '...' : b.text;
          bullet(truncated ?? '', '#555555');
        });
      }
    }
    y += 4;

    // ── SECTION 5 — ACTION PLAN ──
    sectionHeader('Prioritized Action Plan', '05');
    const recs = data?.recommendations ?? [];
    if (recs.length === 0) {
      bodyText('No recommendations generated. Run analysis with a job description for targeted recommendations.', '#555555');
    } else {
      recs.forEach((rec, i) => {
        checkPage(28);
        const pColor = rec.priorityLevel === 'critical' ? '#DC2626' : rec.priorityLevel === 'high' ? '#D97706' : rec.priorityLevel === 'medium' ? '#0EA5E9' : '#10B981';
        const bgColor = rec.priorityLevel === 'critical' ? '#FEF2F2' : rec.priorityLevel === 'high' ? '#FFFBEB' : rec.priorityLevel === 'medium' ? '#EFF6FF' : '#F0FDF4';
        drawRect(margin, y, contentWidth, 7, bgColor);
        setFont(8, 'bold', '#111111');
        const title = `${i+1}. ${(rec.title ?? '').toUpperCase()}`;
        const titleLines = doc.splitTextToSize(title, contentWidth - 26);
        doc.text(titleLines[0], margin + 2, y + 5);
        const pc = hex(pColor);
        doc.setFillColor(pc.r, pc.g, pc.b);
        doc.rect(pageWidth - margin - 22, y + 1.5, 20, 4, 'F');
        setFont(6, 'bold', '#FFFFFF');
        doc.text((rec.priorityLevel ?? '').toUpperCase(), pageWidth - margin - 21, y + 4.5);
        y += 10;
        setFont(7, 'normal', '#444444');
        doc.text(`Effort: ${rec.estimatedEffort ?? 'unknown'}  |  Impact: ${rec.estimatedImpact ?? 'N/A'}/10`, margin + 2, y);
        y += 6;
        const context = typeof rec.causalContext === 'string' ? rec.causalContext : '';
        if (context) {
          bodyText(context, '#666666', 7);
        }
        y += 2;
        hRule('#EEEEEE');
      });
    }
    y += 2;

    // ── SECTION 6 — PROJECT COMPLEXITY ──
    sectionHeader('Project Complexity', '06');
    const proj = data?.projectComplexity;
    if (proj) {
      row('Overall Score', `${proj.overallScore ?? 0} / 100`, proj.overallScore >= 70 ? '#10B981' : proj.overallScore >= 40 ? '#F59E0B' : '#EF4444');
      row('Complexity Tier', proj.complexityTier ?? 'N/A');
      if (proj.summary) { y += 2; bodyText(proj.summary, '#444444'); }
      if (proj.dimensions?.length > 0) {
        y += 3;
        proj.dimensions.forEach((d: any) => {
          checkPage(7);
          const normalizedScore = d.score > 10 ? Math.round(d.score / 10) : Math.round(d.score);
          const cappedScore = Math.min(10, normalizedScore);
          row(d.name, `${cappedScore}/10`);
        });
      }
    }
    y += 4;
    
    // ── SECTION 7 — GITHUB PORTFOLIO ──
    const portfolio = data?.scores?.portfolio;
    if (portfolio) {
      sectionHeader('GitHub Portfolio Analysis', '07');
      row('Portfolio Score', `${portfolio.portfolioScore ?? 0} / 100`, (portfolio.portfolioScore ?? 0) >= 70 ? '#10B981' : (portfolio.portfolioScore ?? 0) >= 40 ? '#F59E0B' : '#EF4444');
      row('Public Repositories', String(portfolio.profileData?.publicRepos ?? 0));
      row('Total Stars', String(portfolio.repositoryMetrics?.totalStars ?? 0));
      row('Languages Used', Object.keys(portfolio.repositoryMetrics?.languageDistribution ?? {}).slice(0, 5).join(', ') || 'N/A');
      row('Last Active', portfolio.repositoryMetrics?.lastActiveDate ? new Date(portfolio.repositoryMetrics.lastActiveDate).toLocaleDateString('en-GB') : 'N/A');
      y += 3;
      if (portfolio.insights) {
        setFont(8, 'bold', '#555555');
        doc.text('INSIGHT SCORES:', margin, y);
        y += 6;
        row('Activity Score', `${portfolio.insights.activityScore ?? 0}%`);
        row('Quality Score', `${portfolio.insights.qualityScore ?? 0}%`);
        row('Diversity Score', `${portfolio.insights.diversityScore ?? 0}%`);
        row('Documentation Score', `${portfolio.insights.documentationScore ?? 0}%`);
        row('Consistency Score', `${portfolio.insights.consistencyScore ?? 0}%`);
      }
      if (portfolio.topProjects?.length > 0) {
        y += 3;
        setFont(8, 'bold', '#555555');
        doc.text('TOP PROJECTS:', margin, y);
        y += 6;
        portfolio.topProjects.slice(0, 5).forEach((proj: any) => {
          checkPage(12);
          setFont(8, 'bold', '#1A1A1A');
          doc.text(proj.name ?? 'Unknown', margin, y);
          setFont(7, 'normal', '#555555');
          doc.text(`Stars: ${proj.stars ?? 0}  |  Language: ${proj.language ?? 'N/A'}  |  README: ${proj.hasReadme ? 'Yes' : 'No'}`, margin, y + 5);
          if (proj.description) {
            setFont(7, 'normal', '#777777');
            const descLines = doc.splitTextToSize(proj.description, contentWidth);
            doc.text(descLines[0], margin, y + 10);
          }
          y += 16;
        });
      }
      y += 4;
    }


    // ── FOOTER ──
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawRect(0, pageHeight - 10, pageWidth, 10, '#0F172A');
      setFont(7, 'normal', '#94A3B8');
      doc.text('ResumeAI Pro — Resume Analysis Intelligence', margin, pageHeight - 4);
      setFont(7, 'normal', '#94A3B8');
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 4);
    }

    doc.save('resume-analysis-report.pdf');
  };

  // FIX 7: GlobalStyles - no DM Serif Display in inner pages
  const GlobalStyles = () => (
    <style>{`
      * {
        font-feature-settings: "zero" 0, "ss01" 0, "ss02" 0;
        font-variant-numeric: normal;
      }
      .font-sans { font-family: inherit; }
    `}</style>
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#FFFFFF" }}>
        <GlobalStyles />
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px" }}>
          <div style={{ width: "200px", height: "30px", backgroundColor: "#1A1A1A", marginBottom: "40px" }} />
          <div style={{ width: "100%", height: "200px", backgroundColor: "#1A1A1A", marginBottom: "20px" }} />
          <div style={{ display: "flex", gap: "20px" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ width: "100px", height: "20px", backgroundColor: "#1A1A1A" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <GlobalStyles />
        <div style={{ fontFamily: "inherit", fontSize: "13px", color: "#FFFFFF", textAlign: "center" }}>
          <div style={{ fontSize: "16px", color: "#FFFFFF", marginBottom: "8px" }}>NO ANALYSIS DATA</div>
          Run an analysis from the Analyze Resume page to see results.
          <button
            onClick={() => navigate("/upload")}
            style={{ display: "block", margin: "24px auto 0", color: "#0EA5E9", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
          >
            → ANALYZE RESUME
          </button>
        </div>
      </div>
    );
  }

  const hasJD = data.scores.keywordCoverage !== null
    && data.scores.keywordCoverage !== undefined;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'critical' || priority === 'high') return "#EF4444";
    if (priority === 'medium') return "#F59E0B";
    return "#10B981";
  };

  const engineScores = [
    { name: "ATS COMPATIBILITY", score: data.scores.format?.parsingReliabilityScore || 65 },
    { name: "SKILL GAP ANALYSIS", score: data.roles.topRoles[0]?.matchScore || 45 },
    { name: "EXPERIENCE DEPTH", score: (() => {
        const years = data?.careerStage?.signals?.totalExperienceYears ?? 0;
        const stage = data?.careerStage?.stage;
        if (stage === 'student') return Math.round(Math.min(60, 30 + (data?.projectComplexity?.overallScore ?? 0) * 0.3));
        if (stage === 'fresher') return Math.round(Math.min(65, 35 + years * 10));
        return Math.round(Math.min(100, 40 + years * 8));
      })() },
    { name: "EDUCATION MATCH", score: (() => {
        const stage = data?.careerStage?.stage;
        const certCount = data?.careerStage?.signals?.certificationCount ?? 0;
        if (stage === 'student') return Math.round(Math.min(70, 40 + certCount * 5));
        if (stage === 'fresher') return Math.round(Math.min(75, 45 + certCount * 4));
        return Math.round(Math.min(90, 55 + certCount * 3));
      })() },
    { name: "IMPACT SCORING", score: data.specificityReport?.overallGrade === 'A' ? 90 : data.specificityReport?.overallGrade === 'B' ? 75 : 50 },
    { name: "KEYWORD ALIGNMENT", score: hasJD ? (data.scores.keywordCoverage?.overallScore ?? 0) : -1 },
    { name: "PORTFOLIO SIGNALS", score: data.scores.portfolio?.portfolioScore || 0 },
    { name: "CAREER TRAJECTORY", score: data.projectComplexity?.overallScore || 55 },
  ];

  const overallScore = Math.round(
    engineScores.reduce((sum, e) => sum + e.score, 0) / engineScores.length
  );

  let scoreColor = "#EF4444";
  if (overallScore >= 70) scoreColor = "#10B981";
  else if (overallScore >= 40) scoreColor = "#F59E0B";

  const scoreLabel = hasJD
    ? (overallScore >= 70
      ? "Strong overall alignment"
      : overallScore >= 50
        ? "Moderate deficiencies detected"
        : "Significant deficiencies detected")
    : "Score based on available engines — add a JD for full scoring";

  // FIX 3: Deduplicate — Quick Wins must not repeat Top Deficiency items
  const allRecs = data.recommendations || [];

  const topDeficiencies = allRecs
    .filter(r => r.priorityLevel === 'critical' || r.priorityLevel === 'high')
    .slice(0, 5);

  const deficiencyIds = new Set(
    topDeficiencies.map(r => (r as any).id ?? r.description)
  );

  const quickWins = allRecs
    .filter(r => {
      const isAlreadyShown = deficiencyIds.has((r as any).id ?? r.description);
      const effortText = (r.estimatedEffort ?? "").toLowerCase();
      // Heuristic: If effort includes "hour" or "min" or "15" or "30", we consider it quick
      const isQuick = effortText.includes('hour') || effortText.includes('min') || effortText.includes('15') || effortText.includes('30');
      return isQuick && !isAlreadyShown;
    })
    .slice(0, 5);

  const missingCoreSkills = data.roles.topRoles[0]?.missingCrucialSkills || [];
  const missingSuppSkills = [];
  const topMatchTitle = data.roles.topRoles[0]?.occupation?.title || "Target Role";

  // FIX 5: Experience years safe display
  const expYears = data?.careerStage?.signals?.totalExperienceYears;
  const expText = (!expYears || expYears === 0)
    ? "No formal work experience detected. Academic projects and certifications are factored into career stage scoring."
    : `Detected ${expYears} year${expYears === 1 ? '' : 's'} of experience`;

  const topRoleForShare = data?.roles?.topRoles?.[0]?.occupation?.title ?? data?.roles?.topRoles?.[0]?.role ?? 'Software Engineer';

  return (
    // FIX 1: No box-shadow, no glow, flat #000000 background
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#FFFFFF", paddingBottom: "100px", overflowX: 'hidden', maxWidth: '100vw' }}>
      <GlobalStyles />
      <ShareModal open={shareModalOpen} onClose={setShareModalOpen} score={overallScore} role={topRoleForShare} />

      {/* Sticky Compact Header */}
      <div style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#000000",
        borderBottom: "1px solid #1A1A1A",
        zIndex: 10,
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: scoreDetailsOpen ? '16px' : '0'
          }}>
            {/* Left: Title + Date + Back */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <button
                onClick={() => navigate('/upload')}
                style={{
                  fontFamily: "inherit", fontSize: '11px', color: '#E0E0E0', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px'
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E0E0E0')}
              >
                ← BACK
              </button>
              <div>
                <p style={{ fontSize: '10px', color: '#0EA5E9', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                  Analysis Results
                </p>
                <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px', marginBottom: 0 }}>
                  Generated {data.meta?.timestamp ? new Date(data.meta.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                </p>
              </div>
            </div>

            {/* Center: Compact Score */}
            <div 
              style={{ display: 'flex', alignItems: 'baseline', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setScoreDetailsOpen(!scoreDetailsOpen)}
              title="Click to toggle score details"
            >
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#F0F0F0' }}>
                {overallScore}
              </span>
              <span style={{ fontSize: '14px', color: '#6B6B6B' }}>/100</span>
              <span style={{
                fontSize: '10px',
                color: overallScore >= 70 ? '#10B981' : overallScore >= 50 ? '#F59E0B' : '#EF4444',
                marginLeft: '8px',
                padding: '2px 8px',
                border: `1px solid ${overallScore >= 70 ? '#10B981' : overallScore >= 50 ? '#F59E0B' : '#EF4444'}`,
              }}>
                {overallScore >= 70 ? 'STRONG' : overallScore >= 50 ? 'NEEDS WORK' : 'CRITICAL'}
              </span>
              <span style={{ fontSize: '12px', color: '#6B6B6B', marginLeft: '8px' }}>
                {scoreDetailsOpen ? '▲' : '▼'}
              </span>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleExport}
                style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#FFFFFF", fontFamily: "inherit", fontSize: "11px", textTransform: "uppercase", padding: "8px 16px", borderRadius: "0px", cursor: "pointer", letterSpacing: "0.08em" }}
              >
                ↓ EXPORT PDF
              </button>
              <button
                onClick={() => {
                  posthog.capture('share_modal_opened');
                  setShareModalOpen(true);
                }}
                style={{
                  background: '#0A66C2', color: '#FFFFFF', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: '11px', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                SHARE
              </button>
              <button
                onClick={() => {
                  posthog.capture('action_plan_viewed');
                  navigate("/action-plan");
                }}
                style={{ background: "#0EA5E9", border: "none", color: "#000000", fontFamily: "inherit", fontSize: "11px", textTransform: "uppercase", padding: "8px 16px", borderRadius: "0px", cursor: "pointer", fontWeight: "bold", letterSpacing: "0.08em" }}
              >
                → VIEW ACTION PLAN
              </button>
            </div>
          </div>

          {/* Collapsible Score Details */}
          {scoreDetailsOpen && (
            <div className="ui-box-override" style={{ background: "#111111", border: "1px solid #333333", padding: "24px", display: "flex", flexWrap: "wrap", gap: "40px", marginTop: "16px", animation: "fadeIn 0.2s ease-in-out" }}>
              <div style={{ flex: "1 1 200px", borderRight: "1px solid #333333", paddingRight: "24px" }}>
                <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  SCORE BREAKDOWN
                </div>
                <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#AAAAAA", lineHeight: 1.6 }}>
                  {scoreLabel}
                </div>
                {!hasJD && (
                  <div style={{ marginTop: "16px" }}>
                    <button
                      onClick={() => navigate('/upload')}
                      style={{ fontFamily: "inherit", fontSize: "10px", color: "#5A5A5A", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", padding: 0, textTransform: "uppercase", textAlign: "left", lineHeight: 1.6 }}
                    >
                      JD ALIGNMENT SCORE REQUIRES A JOB DESCRIPTION.{"\n"}
                      ADD ONE IN ANALYZE RESUME FOR A FULL SCORE. →
                    </button>
                  </div>
                )}
              </div>
              <div style={{ flex: "2 1 400px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", borderTop: "1px solid #333333", borderLeft: "1px solid #333333" }}>
                {engineScores.map((engine) => (
                  <div key={engine.name} style={{ borderBottom: "1px solid #333333", borderRight: "1px solid #333333", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: "inherit", fontSize: "9px", color: "#FFFFFF", textTransform: "uppercase" }}>{engine.name}</div>
                      <div style={{ fontFamily: "inherit", fontSize: "16px", color: engine.score === -1 ? '#E0E0E0' : getScoreColor(engine.score) }}>
                        {engine.score === -1 ? 'N/A' : engine.score}
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '2px', background: '#1A1A1A' }}>
                      <div style={{ width: engine.score === -1 ? '0%' : `${engine.score}%`, height: '100%', background: engine.score === -1 ? '#2A2A2A' : getScoreColor(engine.score), transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "32px auto 0", padding: "0 24px" }}>



        {data?.careerStage?.stage === 'student' && (
          <div style={{ background: '#0D0D0D', border: '1px solid #3A3A3A', borderLeft: '3px solid #F59E0B', padding: '12px 16px', marginTop: '12px', fontSize: '11px', color: '#9A9A9A', lineHeight: 1.7 }}>
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>STUDENT CONTEXT: </span>
            Skill gap scores below 40% are normal for first-year students. These scores show your growth runway, not your current value. Focus on the Action Plan to close gaps systematically.
          </div>
        )}

        {/* Section Navigation Tabs */}
        {(() => {
          const tabCounts: Record<string, number | null> = {
            'OVERVIEW': null,
            'SKILL GAPS': data?.gaps?.genuineGaps?.length ?? 0,
            'ATS': null,
            'IMPACT': data?.specificityReport?.weakBullets?.length ?? 0,
            'KEYWORDS': data?.gaps?.genuineGaps?.length ?? 0,
            'EXPERIENCE': null,
            'EDUCATION': data?.careerStage?.signals?.certificationCount ?? 0,
            'PORTFOLIO': null,
          };
          return (
            <div style={{ display: "flex", borderBottom: "1px solid #3A3A3A", marginTop: "48px", overflowX: "auto", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" }}>
              {(["OVERVIEW", "SKILL GAPS", "ATS", "IMPACT", "KEYWORDS", "EXPERIENCE", "EDUCATION", "PORTFOLIO"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid #0EA5E9" : "2px solid transparent",
                    color: activeTab === tab ? "#FFFFFF" : "#E0E0E0",
                    fontFamily: "inherit",
                    fontSize: "11px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    letterSpacing: "0.08em",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                  onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "#FFFFFF" }}
                  onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.color = "#E0E0E0" }}
                >
                  {tab}
                  {tabCounts[tab] !== null && (tabCounts[tab] as number) > 0 && (
                    <span style={{
                      fontFamily: "inherit",
                      fontSize: '9px',
                      background: activeTab === tab ? '#0EA5E9' : '#333333',
                      color: activeTab === tab ? '#000000' : '#E0E0E0',
                      padding: '1px 5px',
                    }}>
                      {tabCounts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          );
        })()}

        <div style={{ marginTop: "40px" }}>

          {/* OVERVIEW TAB */}
          {activeTab === "OVERVIEW" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

              {/* FIX 3: Top Deficiencies — deduped from Quick Wins */}
              {topDeficiencies.length > 0 && (
                <section>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                    TOP DEFICIENCIES
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {topDeficiencies.map((def, i) => (
                      <div key={i} style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: `4px solid ${getPriorityColor(def.priorityLevel)}`, boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "4px" }}>
                            {def.description}
                          </div>
                          <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#E0E0E0" }}>
                            {typeof def.causalContext === 'string' ? def.causalContext : ''}
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${getPriorityColor(def.priorityLevel)}`, color: getPriorityColor(def.priorityLevel), fontFamily: "inherit", fontSize: "10px", padding: "2px 8px", textTransform: "uppercase", flexShrink: 0, marginLeft: "16px" }}>
                          {def.priorityLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FIX 3: Quick Wins — excludes items already in Top Deficiencies */}
              {quickWins.length > 0 && (
                <section>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#10B981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                    QUICK WINS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {quickWins.map((win, i) => (
                      <div key={i} style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #10B981", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "4px" }}>
                            {win.description}
                          </div>
                          <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#E0E0E0" }}>
                            {typeof win.causalContext === 'string' ? win.causalContext : ''}
                          </div>
                        </div>
                        <div style={{ border: "1px solid #10B981", color: "#10B981", fontFamily: "inherit", fontSize: "10px", padding: "2px 8px", textTransform: "uppercase", flexShrink: 0, marginLeft: "16px" }}>
                          ≤ 2 HOURS
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {topDeficiencies.length === 0 && quickWins.length === 0 && (
                <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>
                  No recommendations generated for this analysis.
                </div>
              )}
            </div>
          )}

          {/* SKILL GAPS TAB */}
          {activeTab === "SKILL GAPS" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <div>
                <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0 0 8px 0", letterSpacing: "0.05em" }}>SKILL GAP ANALYSIS</h2>
                <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginBottom: "16px" }}>
                  Analyzing for: {topMatchTitle}
                </div>
                <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>
                  {missingCoreSkills.length} core skills missing · {missingSuppSkills.length} supporting skills missing
                </div>
              </div>

              {missingCoreSkills.length > 0 && (
                <section>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                    CORE SKILLS (3× WEIGHT)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {missingCoreSkills.map((skill, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #111111", padding: "12px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF" }}>{skill}</span>
                          <span style={{ fontFamily: "inherit", fontSize: "10px", color: "#EF4444", border: "1px solid #EF4444", padding: "2px 6px" }}>MISSING</span>
                        </div>
                        <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#E0E0E0" }}>WEIGHT: 3.0</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {missingSuppSkills.length > 0 && (
                <section>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                    SUPPORTING SKILLS (1.5× WEIGHT)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {missingSuppSkills.map((skill, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #111111", padding: "12px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF" }}>{skill}</span>
                          <span style={{ fontFamily: "inherit", fontSize: "10px", color: "#F59E0B", border: "1px solid #F59E0B", padding: "2px 6px" }}>MISSING</span>
                        </div>
                        <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#E0E0E0" }}>WEIGHT: 1.5</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {missingCoreSkills.length === 0 && missingSuppSkills.length === 0 && (
                <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#10B981" }}>
                  ✓ No skill gaps detected for {topMatchTitle}.
                </div>
              )}
            </div>
          )}

          {/* ATS TAB */}
          {activeTab === "ATS" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0", letterSpacing: "0.05em" }}>ATS COMPATIBILITY</h2>

              <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "32px" }}>
                {/* FIX 7: Use DM Mono for score display */}
                <div style={{ fontFamily: "inherit", fontSize: "72px", color: getScoreColor(engineScores[0].score), lineHeight: 1 }}>
                  {engineScores[0].score}<span style={{ fontFamily: "inherit", fontSize: "20px", color: "#E0E0E0" }}>/100</span>
                </div>
                <div>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em" }}>ATS PARSABILITY SCORE</div>
                  <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginTop: "4px" }}>Computed across 8 common applicant tracking systems</div>
                </div>
              </div>

              {data.scores.format?.risks && data.scores.format.risks.length > 0 && (
                <section>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                    FORMATTING ISSUES
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {data.scores.format.risks.map((risk, i) => (
                      <div key={i} style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "4px" }}>
                            {risk.issue}
                          </div>
                          <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#E0E0E0" }}>
                            {risk.impact}
                          </div>
                          {risk.suggestion && (
                            <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#10B981", marginTop: "8px" }}>
                              → {risk.suggestion}
                            </div>
                          )}
                        </div>
                        <div style={{ border: `1px solid ${getPriorityColor(risk.severity)}`, color: getPriorityColor(risk.severity), fontFamily: "inherit", fontSize: "10px", padding: "2px 8px", textTransform: "uppercase", flexShrink: 0, marginLeft: "16px" }}>
                          {risk.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
                  KEYWORD DENSITY (EXTRACTED)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {data.parsedProfile.skills.normalizedSkills.map((s, i) => (
                    <div key={i} style={{ background: "#3A3A3A", border: "1px solid #555555", color: "#FFFFFF", fontFamily: "inherit", fontSize: "10px", padding: "2px 8px" }}>
                      {s.canonical}
                    </div>
                  ))}
                  {data.gaps?.criticalGaps.map((g, i) => (
                    <div key={`m-${i}`} style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", fontFamily: "inherit", fontSize: "10px", padding: "2px 8px" }}>
                      {g.keyword} (MISSING)
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* IMPACT TAB */}
          {activeTab === "IMPACT" && (() => {
            const specReport = data.specificityReport;
            const details = specReport?.bullets || [];
            const hasSpecData = details.length > 0;
            const hasSpecScore = specReport && (specReport.averageScore !== undefined || specReport.overallGrade);

            const quantified = details.filter(d => (d.score ?? 0) >= 3).length;
            const unquantified = details.filter(d => (d.score ?? 0) < 3).length;
            const total = details.length;
            const pct = total ? Math.round((quantified / total) * 100) : 0;

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0", letterSpacing: "0.05em" }}>IMPACT SCORING</h2>

                {/* FIX 4: Show meaningful fallback even when details array is empty */}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "32px" }}>
                    <div style={{ fontFamily: "inherit", fontSize: "72px", color: getScoreColor((specReport?.averageScore ?? 0) * 20), lineHeight: 1 }}>
                      {specReport?.overallGrade ?? 'N/A'}
                    </div>
                    <div>
                      <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em" }}>IMPACT GRADE</div>
                      <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginTop: "4px" }}>
                        Average score: {specReport?.averageScore ?? 0}/5
                      </div>
                    </div>
                  </div>

                {hasSpecData ? (
                  <>
                    <div>
                      <div style={{ fontFamily: "inherit", fontSize: "13px", color: "#FFFFFF", marginBottom: "16px" }}>
                        {quantified} of {total} bullet points contain measurable results
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "#1A1A1A", display: "flex" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#10B981" }} />
                        <div style={{ width: `${100 - pct}%`, height: "100%", background: "#EF4444" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {details.map((bullet, idx) => (
                        <div key={idx} style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: `4px solid ${(bullet.score ?? 0) < 3 ? "#EF4444" : "#10B981"}`, boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px" }}>
                          <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#FFFFFF", lineHeight: 1.5 }}>
                            {bullet.text}
                          </div>
                          {(bullet.score ?? 0) < 3 && bullet.reasons?.length > 0 && (
                            <div style={{ fontFamily: "inherit", fontSize: '10px', color: '#F59E0B', marginTop: '4px', lineHeight: 1.7 }}>
                              → {bullet.reasons[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* FIX 4: Informative fallback — no more "no bullets found" blank state */
                  <div style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #F59E0B", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "24px" }}>
                    <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginBottom: "12px", textTransform: "uppercase" }}>
                      IMPACT ANALYSIS COMPLETE
                    </div>
                    <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#FFFFFF", lineHeight: 1.8 }}>
                      Score: {specReport?.averageScore ?? 0}/5{"\n"}
                      Grade: {specReport?.overallGrade ?? 'N/A'}
                    </div>
                    <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#FFFFFF", marginTop: "12px", borderTop: "1px solid #333333", paddingTop: "12px" }}>
                      The engine evaluated bullet point specificity across your resume. Add quantified achievements (numbers, percentages, outcomes) to improve this score.
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* KEYWORDS TAB */}
          {activeTab === "KEYWORDS" && (() => {
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0", letterSpacing: "0.05em" }}>KEYWORD ALIGNMENT</h2>

                {!data.scores.keywordCoverage ? (
                  <div style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #F59E0B", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "24px" }}>
                    <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>
                      No job description provided. Add one in Analyze Resume to enable keyword alignment.
                    </div>
                    <button
                      onClick={() => navigate('/upload')}
                      style={{ fontFamily: "inherit", fontSize: "11px", color: "#0EA5E9", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", padding: 0, marginTop: "12px", textTransform: "uppercase" }}
                    >
                      → ADD JOB DESCRIPTION
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "32px" }}>
                      <div style={{ fontFamily: "inherit", fontSize: "72px", color: getScoreColor(data.scores.keywordCoverage.overallScore), lineHeight: 1 }}>
                        {data.scores.keywordCoverage.overallScore}<span style={{ fontFamily: "inherit", fontSize: "20px", color: "#E0E0E0" }}>%</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em" }}>JD MATCH RATE</div>
                        <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginTop: "4px" }}>Alignment against the provided target job description</div>
                      </div>
                    </div>

                    <section>
                      <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                        MISSING KEYWORDS
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {(() => {
                          const missing = data.gaps?.genuineGaps ?? [];
                          return missing.length > 0
                            ? missing.map((g, i) => (
                              <div key={i} style={{
                                background: 'transparent',
                                border: '1px solid #EF4444',
                                color: '#EF4444',
                                fontFamily: "inherit",
                                fontSize: '10px',
                                padding: '4px 10px',
                                letterSpacing: '0.08em'
                              }}>{g.keyword}</div>
                            ))
                            : (() => {
                                const jdScore = data?.scores?.keywordCoverage?.overallScore ?? 0;
                                if (jdScore < 60) {
                                  return (
                                    <div style={{
                                      fontFamily: "inherit",
                                      fontSize: '11px',
                                      color: '#F59E0B',
                                      lineHeight: 1.6
                                    }}>
                                      JD alignment score is {jdScore}%. The keyword gap engine did not detect specific missing skills but your overall alignment is below threshold. Review the JD manually for domain-specific terminology.
                                    </div>
                                  );
                                }
                                return (
                                  <div style={{
                                    fontFamily: "inherit",
                                    fontSize: '11px',
                                    color: '#10B981'
                                  }}>No significant keyword gaps detected. Your resume aligns well with the job description.</div>
                                );
                              })()

                        })()}
                      </div>
                    </section>

                    <section>
                      <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#10B981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", marginTop: "8px" }}>
                        PRESENT KEYWORDS
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {(() => {
                          const present = (data.scores.keywordCoverage?.factors?.keywordMatch?.inputData?.matchedList as string[]) ?? [];
                          return present.length > 0
                            ? present.map((kw, i) => (
                              <div key={i} style={{
                                background: '#3A3A3A',
                                border: '1px solid #737373',
                                color: '#E0E0E0',
                                fontFamily: "inherit",
                                fontSize: '10px',
                                padding: '4px 10px',
                                letterSpacing: '0.08em'
                              }}>{kw}</div>
                            ))
                            : <div style={{
                              fontFamily: "inherit",
                              fontSize: '11px',
                              color: '#E0E0E0'
                            }}>No present keywords detected.</div>;
                        })()}
                      </div>
                    </section>
                  </>
                )}
              </div>
            );
          })()}

          {/* EXPERIENCE TAB */}
          {activeTab === "EXPERIENCE" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0", letterSpacing: "0.05em" }}>EXPERIENCE DEPTH</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "32px" }}>
                <div style={{ fontFamily: "inherit", fontSize: "72px", color: getScoreColor(engineScores[4].score), lineHeight: 1 }}>
                  {engineScores[4].score}<span style={{ fontFamily: "inherit", fontSize: "20px", color: "#E0E0E0" }}>/100</span>
                </div>
                <div>
                  <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em" }}>SENIORITY SIGNAL</div>
                  {/* FIX 5: Null-safe experience years */}
                  <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginTop: "4px", lineHeight: 1.6 }}>
                    {expText}
                  </div>
                </div>
              </div>
              <section>
                <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                  CAREER STAGE ASSIGNMENT
                </div>
                <div style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #10B981", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px" }}>
                  <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "4px" }}>
                    {data.careerStage.stage}
                  </div>
                  <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#E0E0E0" }}>
                    Confidence level: {data.careerStage.confidence}% based on leadership signals and complexity.
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === "EDUCATION" && (() => {
            const signals = data?.careerStage?.signals;
            const certFit = data?.roles?.topRoles?.[0]?.matchScore ?? 0;
            const certCount = signals?.certificationCount ?? 0;
            const isStudent = signals?.isCurrentStudent ?? false;
            const gradYear = signals?.graduationYear;
            const certHeavy = signals?.certificationHeavy ?? false;
            const clusterScore = signals?.certClusterScore ?? 0;

            const rawText = data?.parsedProfile?.rawText ?? '';
            const certProviders = [
              'AWS', 'Amazon', 'Google', 'IBM', 'Microsoft', 'Hugging Face',
              'Forage', 'Coursera', 'Udemy', 'Credly', 'HackerRank', 'CompTIA',
              'Cisco', 'Oracle', 'JPMorgan', 'Tata', 'JPMC',
            ];
            const certLines: string[] = [];

            // Strategy 1: line-split (works for DOCX and well-formatted PDFs)
            rawText.split('\n').forEach(line => {
              const trimmed = line.trim();
              if (trimmed.length < 10 || trimmed.length > 200) return;
              const hasCertProvider = certProviders.some(p =>
                trimmed.toLowerCase().includes(p.toLowerCase())
              );
              const hasCertKeyword =
                /certif|credential|course|program|simulation|essentials|foundations/i.test(trimmed);
              if (hasCertProvider && hasCertKeyword && !certLines.includes(trimmed)) {
                certLines.push(trimmed);
              }
            });

            // Strategy 2: scan full raw string for collapsed PDF text where newlines are gone.
            if (certLines.length === 0) {
              const providerPattern = certProviders
                .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
              const fullTextPattern = new RegExp(
                `(?:^|[•\\-\u2013\u2014])\\s*([^•\\-\u2013\u2014]{10,150}` +
                `(?:${providerPattern})[^•\\-\u2013\u2014]{0,80}` +
                `(?:certif|credential|course|program|simulation|essentials|foundations)` +
                `[^•\\-\u2013\u2014]{0,60})`,
                'gi'
              );
              let m: RegExpExecArray | null;
              while ((m = fullTextPattern.exec(rawText)) !== null) {
                const candidate = m[1].trim().replace(/\s+/g, ' ');
                if (candidate.length >= 10 && candidate.length <= 200 && !certLines.includes(candidate)) {
                  certLines.push(candidate);
                }
              }
            }

            // Strategy 3: fallback — extract bullet segments between • markers that contain a known provider
            if (certLines.length === 0) {
              const segments = rawText.split(/[•\-\u2013\u2014]/);
              segments.forEach(seg => {
                const trimmed = seg.trim().replace(/\s+/g, ' ');
                if (trimmed.length < 10 || trimmed.length > 200) return;
                const hasCertProvider = certProviders.some(p =>
                  trimmed.toLowerCase().includes(p.toLowerCase())
                );
                if (hasCertProvider && !certLines.includes(trimmed)) {
                  certLines.push(trimmed);
                }
              });
            }

            // Cap at 15 to avoid noise
            const displayCerts = certLines.slice(0, 15);

            const mono = "inherit";
            const box: React.CSSProperties = { border: '1px solid #3A3A3A', background: '#0D0D0D', boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: '24px' };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <p style={{ fontFamily: mono, fontSize: '9px', color: '#0EA5E9', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>EDUCATION MATCH</p>

                {/* Score + key signals grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {([
                    { label: 'CERTIFICATION FIT', value: `${certFit}%`, color: certFit >= 70 ? '#10B981' : certFit >= 40 ? '#F59E0B' : '#EF4444' },
                    { label: 'CERTS DETECTED', value: String(certCount), color: '#F0F0F0' },
                    { label: 'CERT CLUSTER SCORE', value: `${clusterScore}/100`, color: '#F0F0F0' },
                  ] as { label: string; value: string; color: string }[]).map(item => (
                    <div key={item.label} style={{ background: '#0D0D0D', border: '1px solid #3A3A3A', boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: '20px 24px' }}>
                      <p style={{ fontFamily: mono, fontSize: '9px', color: '#E0E0E0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>{item.label}</p>
                      <p style={{ fontFamily: mono, fontSize: '28px', color: item.color, lineHeight: 1 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Academic status */}
                <div style={box}>
                  <p style={{ fontFamily: mono, fontSize: '9px', color: '#0EA5E9', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>ACADEMIC STATUS</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: mono, fontSize: '11px', color: '#E0E0E0' }}>Currently Enrolled</span>
                      <span style={{ fontFamily: mono, fontSize: '11px', color: isStudent ? '#10B981' : '#E0E0E0' }}>{isStudent ? 'YES' : 'NO'}</span>
                    </div>
                    {gradYear && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: mono, fontSize: '11px', color: '#E0E0E0' }}>Graduation Year</span>
                        <span style={{ fontFamily: mono, fontSize: '11px', color: '#FFFFFF' }}>{gradYear}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: mono, fontSize: '11px', color: '#E0E0E0' }}>Certification Heavy Profile</span>
                      <span style={{ fontFamily: mono, fontSize: '11px', color: certHeavy ? '#0EA5E9' : '#E0E0E0' }}>{certHeavy ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                </div>

                {/* Detected certifications */}
                {displayCerts.length > 0 ? (
                  <div style={box}>
                    <p style={{ fontFamily: mono, fontSize: '9px', color: '#0EA5E9', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>DETECTED CERTIFICATIONS</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {displayCerts.map((cert, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: '1px solid #333333', paddingBottom: '8px' }}>
                          <span style={{ fontFamily: mono, fontSize: '10px', color: '#0EA5E9', minWidth: '24px' }}>{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ fontFamily: mono, fontSize: '11px', color: '#E0E0E0', lineHeight: 1.6 }}>{cert}</span>
                          <span style={{ fontFamily: mono, fontSize: '9px', color: '#10B981', marginLeft: 'auto', whiteSpace: 'nowrap', paddingTop: '2px' }}>✓ DETECTED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ ...box, textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontFamily: mono, fontSize: '11px', color: '#E0E0E0', lineHeight: 1.8 }}>
                      No certification entries detected in resume text.<br />Add certifications to your resume to improve this score.
                    </p>
                  </div>
                )}

                {/* Score explanation */}
                <div style={{ borderTop: '1px solid #333333', paddingTop: '16px' }}>
                  <p style={{ fontFamily: mono, fontSize: '10px', color: '#E0E0E0', lineHeight: 1.8, letterSpacing: '0.05em' }}>
                    CERTIFICATION FIT is calculated from the number of certifications detected and weighted against the target role requirements for your career stage.
                    {certHeavy && ' A certification-heavy profile is typical and valued for early-career candidates.'}
                  </p>
                </div>
              </div>
            );
          })()}


          {/* PORTFOLIO TAB */}
          {activeTab === "PORTFOLIO" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <h2 style={{ fontFamily: "inherit", fontSize: "16px", color: "#FFFFFF", margin: "0", letterSpacing: "0.05em" }}>PORTFOLIO SIGNALS</h2>
              {data.scores.portfolio ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#0D0D0D", border: "1px solid #3A3A3A", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "32px" }}>
                    <div style={{ fontFamily: "inherit", fontSize: "72px", color: getScoreColor(engineScores[6].score), lineHeight: 1 }}>
                      {engineScores[6].score}<span style={{ fontFamily: "inherit", fontSize: "20px", color: "#E0E0E0" }}>/100</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em" }}>GITHUB / PORTFOLIO IMPACT</div>
                      <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginTop: "4px" }}>
                        Analyzed {data.scores.portfolio.repositoryMetrics?.totalRepos ?? 0} repositories.
                      </div>
                    </div>
                  </div>
                  <section>
                    <div style={{ fontFamily: "inherit", fontSize: "10px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                      TOP PROJECTS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {data.scores.portfolio.topProjects?.map((repo, i) => (
                        <div key={i} style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #10B981", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "4px" }}>
                              {repo.name}
                            </div>
                            <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#E0E0E0" }}>
                              {repo.description || "No description provided."}
                            </div>
                          </div>
                          <div style={{ color: "#FFFFFF", fontFamily: "inherit", fontSize: "10px", textTransform: "uppercase", flexShrink: 0, marginLeft: "16px" }}>
                            ★ {repo.stars} | {repo.language}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <div style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderLeft: "4px solid #F59E0B", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)", padding: "24px" }}>
                  <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#FFFFFF", marginBottom: "8px", textTransform: "uppercase" }}>
                    NO GITHUB PROFILE LINKED
                  </div>
                  <div style={{ fontFamily: "inherit", fontSize: "11px", color: "#FFFFFF", marginBottom: "16px" }}>
                    Link a GitHub profile in Analyze Resume to evaluate portfolio signals.
                  </div>
                  <button
                    onClick={() => navigate('/upload')}
                    style={{ fontFamily: "inherit", fontSize: "11px", color: "#0EA5E9", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", padding: 0, textTransform: "uppercase" }}
                  >
                    → ADD GITHUB PROFILE
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedback(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#0D0D0D', border: '1px solid #3A3A3A',
          color: '#9A9A9A', fontFamily: "'DM Mono', monospace",
          fontSize: '10px', textTransform: 'uppercase',
          padding: '10px 16px', cursor: 'pointer',
          letterSpacing: '0.1em', zIndex: 50,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.color = '#0EA5E9'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#3A3A3A'; e.currentTarget.style.color = '#9A9A9A'; }}
      >
        ✦ FEEDBACK
      </button>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
};


export default Results;
