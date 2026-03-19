import { EvidenceSourceBadge } from "@/components/analysis/EvidenceSourceBadge";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AnalysisResult } from "@/lib/engines/analysis-orchestrator";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface ResultsHeaderProps {
    data: AnalysisResult;
}

export function ResultsHeader({ data }: ResultsHeaderProps) {
    const navigate = useNavigate();

    const displayDate = data.meta?.timestamp
        ? new Date(data.meta.timestamp).toLocaleDateString(
            'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
        )
        : 'Just now';

    const handleExport = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        // Color helpers
        const hex = (h: string) => {
            const r = parseInt(h.slice(1, 3), 16);
            const g = parseInt(h.slice(3, 5), 16);
            const b = parseInt(h.slice(5, 7), 16);
            return { r, g, b };
        };

        // Page break helper
        const checkPage = (needed: number) => {
            if (y + needed > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // Draw full-width divider line
        const divider = (color = '#2A2A2A') => {
            const c = hex(color);
            doc.setDrawColor(c.r, c.g, c.b);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 4;
        };

        // Section heading
        const sectionHead = (text: string) => {
            checkPage(14);
            const c = hex('#0EA5E9');
            doc.setFontSize(8);
            doc.setFont('courier', 'bold');
            doc.setTextColor(c.r, c.g, c.b);
            doc.text(text.toUpperCase(), margin, y);
            y += 5;
            divider('#0EA5E9');
        };

        // Body text with word wrap
        const bodyText = (text: string, color = '#CCCCCC', size = 9) => {
            const c = hex(color);
            doc.setFontSize(size);
            doc.setFont('courier', 'normal');
            doc.setTextColor(c.r, c.g, c.b);
            const lines = doc.splitTextToSize(text, contentWidth);
            lines.forEach((line: string) => {
                checkPage(6);
                doc.text(line, margin, y);
                y += 5;
            });
        };

        // Key-value row
        const kv = (key: string, value: string, valueColor = '#F0F0F0') => {
            checkPage(6);
            const kc = hex('#666666');
            const vc = hex(valueColor);
            doc.setFontSize(8);
            doc.setFont('courier', 'bold');
            doc.setTextColor(kc.r, kc.g, kc.b);
            doc.text(key.toUpperCase() + ':', margin, y);
            doc.setFont('courier', 'normal');
            doc.setTextColor(vc.r, vc.g, vc.b);
            doc.text(value, margin + 52, y);
            y += 5;
        };

        // ─── COVER ───────────────────────────────
        // Black background on first page header
        const bg = hex('#0D0D0D');
        doc.setFillColor(bg.r, bg.g, bg.b);
        doc.rect(0, 0, pageWidth, 50, 'F');

        doc.setFontSize(20);
        doc.setFont('courier', 'bold');
        const ac = hex('#0EA5E9');
        doc.setTextColor(ac.r, ac.g, ac.b);
        doc.text('RESUME ANALYSIS REPORT', margin, 22);

        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        const gc = hex('#666666');
        doc.setTextColor(gc.r, gc.g, gc.b);
        doc.text(
            `Generated: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`,
            margin, 32
        );
        doc.text('ResumeAI — resumeai.pro', margin, 38);

        y = 58;
        divider();

        // ─── 1. CAREER STAGE ─────────────────────
        sectionHead('01 — Career Stage');
        const stage = data?.careerStage;
        if (stage) {
            kv('Stage', stage.stage?.toUpperCase() ?? 'Unknown');
            kv('Confidence', `${stage.confidence ?? 0}%`);
            kv('Reasoning', stage.reasoning ?? 'N/A');
            if (stage.signals?.certificationCount) {
                kv('Certifications Detected', String(stage.signals.certificationCount));
            }
        }
        y += 4;

        // ─── 2. OVERALL SCORE ────────────────────
        sectionHead('02 — Overall Score');
        const hasJD = !!data?.scores?.keywordCoverage;
        const engineScoreList = [
            { n: 'ATS Compatibility', s: (data?.scores?.format as any)?.parsingReliabilityScore ?? 65 },
            { n: 'Skill Gap', s: data?.roles?.topRoles?.[0]?.matchScore ?? 45 },
            { n: 'Impact Scoring', s: data?.specificityReport?.averageScore ? Math.round(data.specificityReport.averageScore * 20) : 50 },
            { n: 'Keyword Alignment', s: data?.scores?.keywordCoverage?.overallScore ?? -1 },
            { n: 'Experience Depth', s: data?.roles?.topRoles?.[0]?.matchScore ?? 60 },
            { n: 'Education Match', s: data?.roles?.topRoles?.[0]?.matchScore ?? 80 },
            { n: 'Portfolio Signals', s: data?.scores?.portfolio?.portfolioScore ?? 0 },
            { n: 'Career Trajectory', s: data?.projectComplexity?.overallScore ?? 55 },
        ];

        const scoredEngines = engineScoreList.filter(e => e.s !== -1);
        const avg = Math.round(scoredEngines.reduce((sum, e) => sum + e.s, 0) / scoredEngines.length);

        kv('Overall Score', hasJD ? `${data?.scores?.keywordCoverage?.overallScore ?? 0}%` : `${avg}% (avg — no JD provided)`);
        y += 2;

        engineScoreList.forEach(e => {
            kv(e.n,
                e.s === -1 ? 'N/A' : `${e.s}%`,
                e.s === -1 ? '#666666' : e.s >= 70 ? '#10B981' : e.s >= 40 ? '#F59E0B' : '#EF4444'
            );
        });
        y += 4;

        // ─── 3. TOP ROLE MATCH ───────────────────
        sectionHead('03 — Top Role Match');
        const top = data?.roles?.topRoles?.[0];
        if (top) {
            kv('Role', top.occupation?.title ?? 'N/A');
            kv('Overall Fit', `${top.matchScore ?? 0}%`);
            kv('Core Skill Match', `${top.matchScore ?? 0}%`);
            kv('Experience Fit', `${top.matchScore ?? 0}%`);
            kv('Certification Fit', `${top.matchScore ?? 0}%`);
            if (top.missingCrucialSkills && top.missingCrucialSkills.length > 0) {
                y += 2;
                bodyText('Critical Gaps: ' + top.missingCrucialSkills.slice(0, 5).join(', '), '#EF4444');
            }
        }
        y += 4;

        // ─── 4. KEYWORD GAPS ─────────────────────
        sectionHead('04 — Keyword Gap Analysis');
        if (!hasJD) {
            bodyText('No job description provided.', '#666666');
        } else {
            const genuine = data?.gaps?.genuineGaps ?? [];
            const mention = data?.gaps?.mentionGaps ?? [];
            if (genuine.length > 0) {
                bodyText('Genuine Gaps (need to learn):', '#EF4444');
                genuine.forEach((g: any) => {
                    bodyText(`  • ${g.keyword || g.skill || g}`, '#CC4444');
                });
            }
            if (mention.length > 0) {
                y += 2;
                bodyText('Mention Gaps (already know, add to resume):', '#F59E0B');
                mention.forEach((g: any) => {
                    bodyText(`  • ${g.keyword || g.skill || g}`, '#CC8800');
                });
            }
            if (genuine.length === 0 && mention.length === 0) {
                bodyText('No significant keyword gaps detected.', '#10B981');
            }
        }
        y += 4;

        // ─── 5. IMPACT SCORING ───────────────────
        sectionHead('05 — Bullet Impact Scoring');
        const spec = data?.specificityReport;
        if (spec) {
            kv('Grade', spec.overallGrade ?? 'F');
            kv('Average Score', `${spec.averageScore ?? 0}/5`);
            kv('Total Bullets', String(spec.bullets?.length ?? 0));
            kv('Strong Bullets', String(spec.strongBullets?.length ?? 0));
            kv('Weak Bullets', String(spec.weakBullets?.length ?? 0));
            if (spec.weakBullets?.length > 0) {
                y += 2;
                bodyText('Weakest bullets:', '#F59E0B');
                spec.weakBullets.slice(0, 3).forEach(b => {
                    bodyText(`  • ${b.text?.slice(0, 80)}...`, '#888888');
                });
            }
        }
        y += 4;

        // ─── 6. ACTION PLAN ──────────────────────
        sectionHead('06 — Action Plan');
        const recs = data?.recommendations ?? [];
        if (recs.length === 0) {
            bodyText('No recommendations generated.', '#666666');
        } else {
            recs.forEach((rec, i) => {
                checkPage(20);
                const priorityColor =
                    rec.priorityLevel === 'critical' ? '#EF4444'
                        : rec.priorityLevel === 'high' ? '#F59E0B'
                            : rec.priorityLevel === 'medium' ? '#0EA5E9'
                                : '#10B981';

                doc.setFontSize(9);
                doc.setFont('courier', 'bold');
                const tc = hex('#F0F0F0');
                doc.setTextColor(tc.r, tc.g, tc.b);
                doc.text(`${i + 1}. ${rec.title?.toUpperCase() ?? ''}`, margin, y);
                y += 5;

                const pc = hex(priorityColor);
                doc.setFontSize(7);
                doc.setFont('courier', 'normal');
                doc.setTextColor(pc.r, pc.g, pc.b);
                doc.text(`[${(rec.priorityLevel ?? '').toUpperCase()}] Effort: ${rec.estimatedEffort ?? ''}`, margin, y);
                y += 5;

                bodyText(rec.causalContext ?? '', '#888888', 8);
                y += 3;
            });
        }
        y += 4;

        // ─── 7. PROJECT COMPLEXITY ───────────────
        sectionHead('07 — Project Complexity');
        const proj = data?.projectComplexity;
        if (proj) {
            kv('Overall Score', `${proj.overallScore ?? 0}/100`);
            kv('Tier', (proj as any).tier ?? proj.complexityTier ?? 'N/A');
            if (proj.summary) {
                bodyText(proj.summary, '#888888');
            }
        }
        y += 4;

        // ─── FOOTER on every page ────────────────
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            const fc = hex('#333333');
            doc.setDrawColor(fc.r, fc.g, fc.b);
            doc.setLineWidth(0.2);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
            doc.setFontSize(7);
            doc.setFont('courier', 'normal');
            const gc2 = hex('#555555');
            doc.setTextColor(gc2.r, gc2.g, gc2.b);
            doc.text('ResumeAI — resumeai.pro', margin, pageHeight - 7);
            doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 7);
        }

        // ─── SAVE ────────────────────────────────
        doc.save('resume-analysis-report.pdf');
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ borderBottom: '1px solid #1F1F1F', paddingBottom: '24px' }}
        >
            <div className="space-y-1">
                <div
                    className="flex items-center gap-2 mb-2 cursor-pointer transition-colors"
                    style={{ color: '#E0E0E0', fontFamily: "inherit", fontSize: '11px' }}
                    onClick={() => navigate("/upload")}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#E0E0E0')}
                >
                    <ArrowLeft style={{ width: '14px', height: '14px' }} />
                    <span>Back to Upload</span>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{
                        fontFamily: "inherit",
                        fontSize: '10px',
                        color: '#0EA5E9',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                    }}>ANALYSIS RESULTS</p>
                    <p style={{
                        fontFamily: "inherit",
                        fontSize: '12px',
                        color: '#E0E0E0',
                        lineHeight: 1.8
                    }}>
                        Generated {displayDate}
                    </p>
                </div>
                <div className="flex items-center gap-2"
                    style={{ fontFamily: "inherit", fontSize: '11px', color: '#E0E0E0', letterSpacing: '0.05em' }}
                >
                    <span style={{
                        fontFamily: "inherit",
                        fontSize: '10px',
                        color: '#E0E0E0',
                        letterSpacing: '0.1em'
                    }}>RESUME</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => navigate("/upload")}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333333'; e.currentTarget.style.color = '#E0E0E0'; }}
                    style={{
                        background: 'transparent',
                        border: '1px solid #333333',
                        color: '#E0E0E0',
                        fontFamily: "inherit",
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '10px 20px',
                        borderRadius: 0,
                        cursor: 'pointer',
                        transition: 'border-color 150ms ease, color 150ms ease',
                    }}
                >
                    New Analysis
                </button>
                <button
                    onClick={() => navigate('/action-plan')}
                    style={{
                        background: '#0EA5E9',
                        color: '#000000',
                        fontFamily: "inherit",
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: 0,
                        cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0284C7')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0EA5E9')}
                >
                    → VIEW ACTION PLAN
                </button>
                <button
                    onClick={handleExport}
                    style={{
                        background: '#0EA5E9',
                        border: 'none',
                        color: '#000000',
                        fontFamily: "inherit",
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '10px 20px',
                        borderRadius: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Download style={{ width: '14px', height: '14px' }} />
                    Export Report
                </button>
            </div>
        </div>
    );
}
