import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AnalysisResult } from "@/lib/engines/analysis-orchestrator";
import { ActionItem, categoryConfig, ActionCategoryCard } from "@/components/action-plan/ActionCategoryCard";
import { FeedbackModal } from '@/components/FeedbackModal';
import { safeStorage } from "@/lib/storage-safe";
import posthog from 'posthog-js';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from 'framer-motion';

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

const ActionPlan = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisHasBeenRun, setAnalysisHasBeenRun] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PriorityFilter>('all');
  const [exporting, setExporting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [explorerRoleName, setExplorerRoleName] = useState<string>('');


  useEffect(() => {
    const savedRoleName = safeStorage.getItem('explorerRoleName');
    if (savedRoleName) setExplorerRoleName(savedRoleName);

    const storedData = safeStorage.getItem("resumeAnalysis");

    if (!storedData) {
      // No resume analysis — check if coming from Career Explorer before giving up
      const explorerRaw = safeStorage.getItem('careerExplorerTarget');
      if (explorerRaw) {
        try {
          const explorerData = JSON.parse(explorerRaw);
          if (explorerData?.fromCareerExplorer) {
            const explorerItems: ActionItem[] = [];
            explorerData.missingCore.forEach((skill: string, i: number) => {
              explorerItems.push({
                id: `explorer-core-${i}`,
                category: 'skills',
                title: `Acquire Core Skill: ${skill}`,
                description: `${skill} is a core requirement for ${explorerData.roleName}. This is a 2x weighted gap.`,
                completed: false,
                priorityLevel: 'critical',
                estimatedEffort: '2-4 weeks',
                recruiterImpact: 9,
                triggerReason: `Missing core skill for ${explorerData.roleName}`,
              });
            });
            explorerData.missingSupporting.forEach((skill: string, i: number) => {
              explorerItems.push({
                id: `explorer-supporting-${i}`,
                category: 'skills',
                title: `Add Supporting Skill: ${skill}`,
                description: `${skill} is a supporting requirement for ${explorerData.roleName}.`,
                completed: false,
                priorityLevel: 'high',
                estimatedEffort: '1-2 weeks',
                recruiterImpact: 6,
                triggerReason: `Missing supporting skill for ${explorerData.roleName}`,
              });
            });
            if (explorerItems.length > 0) {
              setItems(explorerItems);
              setAnalysisHasBeenRun(true);
            }
            if (explorerData?.roleName) {
              safeStorage.setItem('explorerRoleName', explorerData.roleName);
            }
            safeStorage.setItem('careerExplorerTarget', '');
          }
        } catch {
          // pass
        }
      }
      setLoading(false);
      return;
    }

    setAnalysisHasBeenRun(true);

    try {
      const data: AnalysisResult = JSON.parse(storedData);

      const mappedItems: ActionItem[] = data.recommendations.map(rec => {
        let category: ActionItem["category"] = "priority";
        const source = rec.category.toLowerCase();

        if (source.includes("portfolio")) category = "portfolio";
        else if (source.includes("skill") || source.includes("gap")) category = "skills";
        else if (source.includes("certification") || source.includes("cert")) category = "certifications";

        return {
          id: rec.id,
          category,
          title: rec.title,
          description: rec.description,
          completed: false,
          priorityLevel: rec.priorityLevel,
          estimatedEffort: rec.estimatedEffort,
          recruiterImpact: rec.estimatedImpact,
          triggerReason: rec.causalContext,
        };
      });

      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      mappedItems.sort((a, b) => priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel]);

      setItems(mappedItems);
    } catch (e) {
      console.error("Failed to parse analysis data", e);
    } finally {
      setLoading(false);
    }


  }, []);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const filteredItems: ActionItem[] = activeFilter === 'all'
    ? items
    : items.filter(item => item.priorityLevel === activeFilter.toLowerCase());

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Cross-data counts for filter tabs (based on entire dataset, not filtered set)
  const allOverallCount = items.length;
  const criticalOverallCount = items.filter(i => i.priorityLevel === 'critical').length;
  const highOverallCount = items.filter(i => i.priorityLevel === 'high').length;
  const mediumOverallCount = items.filter(i => i.priorityLevel === 'medium').length;
  const lowOverallCount = items.filter(i => i.priorityLevel === 'low').length;

  // Total effort estimate for current filtered view
  const effortToMinutes: Record<string, number> = {
    '15-30 minutes': 22.5,
    '30-60 minutes': 45,
    '30 minutes': 30,
    '30-45 minutes': 37.5,
    '1 hour': 60,
    '1-2 hours': 90,
    '2-3 hours': 150,
    '2-4 hours': 180,
    '1-2 days': 1440,
    '3-5 days': 5760,
    '1-2 weeks': 10080,
    '2-4 weeks': 20160,
  };

  const totalEffortMinutes = filteredItems.filter(i => !i.completed).reduce((sum, item) => {
    let effort = item.estimatedEffort?.toLowerCase().trim();
    if (effort === 'ongoing') return sum;
    let minutes = effortToMinutes[effort] || 90; // Defaulting to 90 min if unknown
    return sum + minutes;
  }, 0);

  const formatDuration = (n: number, unit: string): string =>
    `~${n} ${n === 1 ? unit.replace(/s$/, '') : unit}`;

  function formatTotalEffort(minutes: number): string {
    if (minutes <= 0) return "0 hours";
    if (minutes < 120) return formatDuration(Math.max(1, Math.round(minutes / 60)), "hours");
    if (minutes < 1440) return formatDuration(Math.round(minutes / 60), "hours");
    if (minutes < 10080) return formatDuration(Math.round(minutes / 1440), "days");
    if (minutes < 40320) return formatDuration(Math.round(minutes / 10080), "weeks");
    return formatDuration(Math.round(minutes / 40320), "months");
  }

  const GlobalStyles = () => (
    <style>{`
      * {
        font-feature-settings: "zero" 0, "ss01" 0, "ss02" 0;
        font-variant-numeric: normal;
      }
    `}</style>
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      posthog.capture('action_plan_exported');
      const { jsPDF } = await import('jspdf');
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

      // ── COVER PAGE ──
      doc.setFillColor(255,255,255);
      doc.rect(0,0,pageWidth,pageHeight,'F');
      drawRect(0, 0, pageWidth, 55, '#0F172A');

      setFont(22, 'bold', '#0EA5E9');
      doc.text('ACTION PLAN', margin, 22);
      setFont(22, 'normal', '#FFFFFF');
      doc.text('REPORT', margin, 33);
      setFont(8, 'normal', '#94A3B8');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB',{ year:'numeric', month:'long', day:'numeric' })}`, margin, 43);
      doc.text('ResumeAI Pro — Resume Analysis Intelligence', margin, 49);

      // Progress summary
      y = 65;
      drawRect(margin, y, 52, 30, '#F8FAFC');
      setFont(24, 'bold', '#0EA5E9');
      doc.text(`${completedCount}`, margin + 6, y + 16);
      setFont(9, 'normal', '#555555');
      doc.text(`/ ${totalCount}`, margin + 22, y + 16);
      setFont(7, 'normal', '#888888');
      doc.text('ITEMS RESOLVED', margin + 4, y + 24);

      // Priority counts in grid
      const priorities = [
        { label: 'CRITICAL', count: items.filter(i => i.priorityLevel === 'critical').length, color: '#DC2626' },
        { label: 'HIGH', count: items.filter(i => i.priorityLevel === 'high').length, color: '#D97706' },
        { label: 'MEDIUM', count: items.filter(i => i.priorityLevel === 'medium').length, color: '#0EA5E9' },
        { label: 'LOW', count: items.filter(i => i.priorityLevel === 'low').length, color: '#10B981' },
      ];
      let px = margin + 60;
      priorities.forEach(p => {
        const pc = hex(p.color);
        doc.setFillColor(pc.r, pc.g, pc.b);
        doc.rect(px, y + 2, 28, 26, 'F');
        setFont(18, 'bold', '#FFFFFF');
        doc.text(String(p.count), px + 4, y + 16);
        setFont(6, 'bold', '#FFFFFF');
        doc.text(p.label, px + 4, y + 23);
        px += 32;
      });

      // Role name if from Career Explorer
      const roleName = explorerRoleName;
      if (roleName) {
        y = 102;
        setFont(8, 'normal', '#94A3B8');
        doc.text(`TARGET ROLE: ${roleName.toUpperCase()}`, margin, y);
      }

      y = 108;
      const c = hex('#CCCCCC');
      doc.setDrawColor(c.r, c.g, c.b);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // ── SECTIONS ──
      const categoryLabels: Record<string, string> = {
        priority: 'RESUME STRUCTURE',
        skills: 'SKILL DEVELOPMENT',
        certifications: 'CERTIFICATIONS',
        portfolio: 'PORTFOLIO & VISIBILITY',
      };
      const categoryColors: Record<string, string> = {
        priority: '#0EA5E9',
        skills: '#F59E0B',
        certifications: '#10B981',
        portfolio: '#8B5CF6',
      };
      const categoryDescriptions: Record<string, string> = {
        priority: 'Fixes to resume structure, formatting, and content quality',
        skills: 'Technical skills to acquire for your target role',
        certifications: 'Certifications that strengthen your profile',
        portfolio: 'Actions to improve your GitHub and project visibility',
      };

      const categories = ['priority', 'skills', 'certifications', 'portfolio'] as const;

      categories.forEach(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return;

        checkPage(20);
        const catColor = categoryColors[cat];
        const cc = hex(catColor);
        drawRect(margin, y, contentWidth, 10, '#0F172A');
        doc.setFillColor(cc.r, cc.g, cc.b);
        doc.rect(margin, y, 3, 10, 'F');
        setFont(9, 'bold', '#FFFFFF');
        doc.text(categoryLabels[cat], margin + 7, y + 7);
        setFont(7, 'normal', '#94A3B8');
        doc.text(`${catItems.length} item${catItems.length > 1 ? 's' : ''}`, pageWidth - margin - 18, y + 7);
        y += 13;

        setFont(7, 'normal', '#666666');
        doc.text(categoryDescriptions[cat], margin, y);
        y += 8;

        catItems.forEach((item, i) => {
          checkPage(32);
          const pColor = item.priorityLevel === 'critical' ? '#DC2626' : item.priorityLevel === 'high' ? '#D97706' : item.priorityLevel === 'medium' ? '#0EA5E9' : '#10B981';
          const bgColor = item.priorityLevel === 'critical' ? '#FEF2F2' : item.priorityLevel === 'high' ? '#FFFBEB' : item.priorityLevel === 'medium' ? '#EFF6FF' : '#F0FDF4';

          // Item header
          drawRect(margin, y, contentWidth, 8, bgColor);
          const checkbox = item.completed ? '[X]' : '[ ]';
          setFont(8, 'bold', '#111111');
          const titleText = `${checkbox} ${(item.title ?? '').toUpperCase()}`;
          const titleLines = doc.splitTextToSize(titleText, contentWidth - 28);
          doc.text(titleLines[0], margin + 2, y + 5.5);

          // Priority badge
          const pc = hex(pColor);
          doc.setFillColor(pc.r, pc.g, pc.b);
          doc.rect(pageWidth - margin - 22, y + 2, 20, 4, 'F');
          setFont(6, 'bold', '#FFFFFF');
          doc.text((item.priorityLevel ?? '').toUpperCase(), pageWidth - margin - 21, y + 5);
          y += 11;

          // Effort and impact
          setFont(7, 'normal', '#444444');
          const impactVal = Math.min(item.recruiterImpact ?? 0, 10);
          doc.text(`Effort: ${item.estimatedEffort ?? 'unknown'}  |  Impact: ${impactVal}/10`, margin + 2, y);
          y += 7;

          // Description
          if (item.description) {
            setFont(8, 'normal', '#222222');
            const descLines = doc.splitTextToSize(item.description, contentWidth - 4);
            descLines.forEach((line: string) => {
              checkPage(6);
              doc.text(line, margin + 2, y);
              y += 5.5;
            });
          }

          // Why flagged
          if (item.triggerReason) {
            y += 2;
            setFont(7, 'bold', '#555555');
            doc.text('WHY THIS WAS FLAGGED:', margin + 2, y);
            y += 5;
            setFont(7, 'normal', '#666666');
            const reasonLines = doc.splitTextToSize(`> ${item.triggerReason}`, contentWidth - 6);
            reasonLines.forEach((line: string) => {
              checkPage(6);
              doc.text(line, margin + 2, y);
              y += 5;
            });
          }

          y += 3;
          if (i < catItems.length - 1) {
            const lc = hex('#DDDDDD');
            doc.setDrawColor(lc.r, lc.g, lc.b);
            doc.setLineWidth(0.2);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;
          }
        });
        y += 8;
      });

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

      doc.save('action-plan.pdf');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#000000" }} />;
  }

  if (!analysisHasBeenRun) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <GlobalStyles />
          <div style={{ fontSize: "16px", color: "#FFFFFF", marginBottom: "8px" }}>NO ANALYSIS DATA</div>
          <p style={{ color: '#FFFFFF', fontSize: '13px' }}>Run an analysis from the Analyze Resume page to see results.</p>
          <button
            onClick={() => navigate("/upload")}
            style={{ display: "block", margin: "24px auto 0", color: "#0EA5E9", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px" }}
          >
            → ANALYZE RESUME
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div style={{ backgroundColor: "#000000", color: "#FFFFFF", paddingBottom: "100px" }}>
      <GlobalStyles />

      {/* Sticky Page Header */}
      <div style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#000000",
        borderBottom: "1px solid #1A1A1A",
        zIndex: 10,
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "8px", color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "6px" }}>
              RESUME OPTIMIZATION
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#FFFFFF", margin: 0, fontWeight: "normal", lineHeight: 1 }}>
              Action Plan
            </h1>
            {explorerRoleName && (
              <div style={{ fontSize: '11px', color: '#0EA5E9', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                PLAN FOR: {explorerRoleName}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#FFFFFF", marginTop: "8px" }}>
              Every recommendation is traceable to a specific resume deficiency.
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={handleExport}
              style={{ background: "transparent", border: "1px solid #3A3A3A", color: "#FFFFFF", fontSize: "11px", textTransform: "uppercase", padding: "8px 16px", borderRadius: "0px", cursor: "pointer", letterSpacing: "0.08em" }}>
              {exporting ? "EXPORTING..." : "↓ EXPORT PLAN"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        {/* Progress Card */}
        <div className="card-glow" style={{ background: "#0D0D0D", border: "1px solid #3A3A3A", borderTop: "2px solid #0EA5E9", padding: "24px", marginTop: "24px", borderRadius: "0px", boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: "28px", color: "#FFFFFF", lineHeight: 1 }}>
              {completedCount} <span style={{ color: "#FFFFFF" }}>/ {totalCount}</span>
              <span style={{ fontSize: "12px", color: "#FFFFFF", marginLeft: "12px" }}>items resolved</span>
            </div>
            <div style={{ fontFamily: "inherit", fontSize: "32px", color: "#0EA5E9", lineHeight: 1 }}>
              {percentage}%
            </div>
          </div>

          <div style={{ width: "100%", height: "3px", background: "#1A1A1A", marginTop: "16px" }}>
            <div style={{ width: `${percentage}%`, height: "100%", background: "#0EA5E9", transition: "width 0.3s ease" }} />
          </div>

          <div style={{ display: "flex", gap: "32px", marginTop: "24px" }}>
            {criticalOverallCount > 0 && (
              <div style={{
                textAlign: 'center',
                padding: '16px 24px',
                background: '#0D0D0D',
                border: '1px solid #3A3A3A',
                borderTop: '2px solid #EF4444',
                boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)"
              }}>
                <div style={{
                  fontSize: '28px',
                  color: '#EF4444',
                  lineHeight: 1,
                }}>{criticalOverallCount}</div>
                <div style={{
                  fontSize: '9px',
                  color: '#FFFFFF',
                  letterSpacing: '0.15em',
                  marginTop: '6px',
                  textTransform: 'uppercase',
                }}>CRITICAL</div>
              </div>
            )}
            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              background: '#0D0D0D',
              border: '1px solid #3A3A3A',
              borderTop: '2px solid #F59E0B',
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)"
            }}>
              <div style={{
                fontSize: '28px',
                color: '#F59E0B',
                lineHeight: 1,
              }}>
                {filteredItems.filter(i => i.priorityLevel === 'high').length}
              </div>
              <div style={{
                fontSize: '9px',
                color: '#FFFFFF',
                letterSpacing: '0.15em',
                marginTop: '6px',
                textTransform: 'uppercase',
              }}>HIGH</div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              background: '#0D0D0D',
              border: '1px solid #3A3A3A',
              borderTop: '2px solid #0EA5E9',
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)"
            }}>
              <div style={{
                fontSize: '28px',
                color: '#0EA5E9',
                lineHeight: 1,
              }}>
                {filteredItems.filter(i => i.priorityLevel === 'medium').length}
              </div>
              <div style={{
                fontSize: '9px',
                color: '#FFFFFF',
                letterSpacing: '0.15em',
                marginTop: '6px',
                textTransform: 'uppercase',
              }}>MEDIUM</div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              background: '#0D0D0D',
              border: '1px solid #3A3A3A',
              borderTop: '2px solid #10B981',
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)"
            }}>
              <div style={{
                fontSize: '28px',
                color: '#10B981',
                lineHeight: 1,
              }}>
                {filteredItems.filter(i => i.priorityLevel === 'low').length}
              </div>
              <div style={{
                fontSize: '9px',
                color: '#FFFFFF',
                letterSpacing: '0.15em',
                marginTop: '6px',
                textTransform: 'uppercase',
              }}>LOW</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #333333", marginTop: "24px", overflowX: "auto" }}>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(tab => {
            const isActive = activeFilter === tab.toLowerCase();
            const countMap: Record<string, number> = {
              ALL: allOverallCount,
              CRITICAL: criticalOverallCount,
              HIGH: highOverallCount,
              MEDIUM: mediumOverallCount,
              LOW: lowOverallCount
            };
            const currentCount = countMap[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab.toLowerCase() as PriorityFilter)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #0EA5E9" : "2px solid transparent",
                  color: isActive ? "#FFFFFF" : "#E0E0E0",
                  fontSize: "11px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#FFFFFF" }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#E0E0E0" }}
              >
                {tab}
                <span style={{
                  background: "#0EA5E9",
                  color: "#000000",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "0px"
                }}>
                  {currentCount}
                </span>
              </button>
            )
          })}
        </div>

        {/* Estimated Time Bar */}
        <div style={{ marginTop: "16px" }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0D0D0D',
            border: '1px solid #3A3A3A',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
            padding: '8px 16px',
          }}>
            <span style={{
              fontSize: '9px',
              color: '#FFFFFF',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>EST. TIME</span>
            <span style={{
              fontSize: '13px',
              color: '#FFFFFF'
            }}>{formatTotalEffort(totalEffortMinutes)}</span>
          </div>
        </div>

        {/* Action Items List */}
        <div style={{ marginTop: "32px" }}>
          {filteredItems.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#FFFFFF", textAlign: "center", padding: "40px" }}>
              NO ITEMS IN THIS CATEGORY.
            </div>
          ) : (
            (["priority", "skills", "certifications", "portfolio"] as const).map((cat, idx) => (
              <motion.div
                key={cat}
                variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: (i: number) => ({
                        opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' }
                    })
                }}
                initial="hidden"
                animate="visible"
                custom={idx}
              >
                <ActionCategoryCard
                  cat={cat}
                  categoryItems={filteredItems.filter(i => i.category === cat)}
                  catIdx={idx}
                  toggleItem={toggleItem}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
      <div style={{ maxWidth: "1100px", margin: "32px auto 0", padding: "0 24px 40px 24px" }}>
        <button onClick={() => navigate("/career-explorer")}
          style={{ background: "transparent", border: "1px solid #0EA5E9", color: "#0EA5E9", fontSize: "11px", textTransform: "uppercase", padding: "12px 24px", borderRadius: "0px", cursor: "pointer", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "8px" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#0EA5E9"; e.currentTarget.style.color = "#000000"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0EA5E9"; }}>
          ⊕ EXPLORE CAREER PATHS
        </button>
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
    </DashboardLayout>
  );
};


export default ActionPlan;
