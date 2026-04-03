import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { searchOccupations } from '@/lib/occupation-data';
import type { Occupation } from '@/lib/occupation-types';
import type { AnalysisResult } from '@/lib/engines/analysis-orchestrator';
import { safeStorage } from '@/lib/storage-safe';

const CareerExplorer = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Occupation | null>(null);
  const [comparisonRoles, setComparisonRoles] = useState<Occupation[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Load analysis from session
  useEffect(() => {
    try {
      const raw = safeStorage.getItem('resumeAnalysis');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.careerStage && parsed?.scores) {
          setAnalysisData(parsed);
        }
      }
    } catch {
      // Pass
    }
  }, []);

  const currentTitle = (analysisData?.roles?.topRoles?.[0] as any)?.role || 'Engineer';
  const suggestedRoles = [
    `Senior ${currentTitle.replace(/^Senior\s+/i, '')}`,
    'Staff Engineer',
    'ML Engineer',
    'AI Product Manager',
    'Technical Lead',
    'Prompt Engineer'
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchOccupations(searchQuery).slice(0, 10);
  }, [searchQuery]);

  const displayedRoles = searchResults;

  const handleRoleSelect = (role: Occupation) => {
    setSelectedRole(role);
    setComparisonRoles(prev => {
      const filtered = prev.filter(r => r.id !== role.id);
      return [role, ...filtered].slice(0, 3);
    });
  };

  const calculateGaps = (role: Occupation) => {
    if (!analysisData) return { matchPercent: 0, missingCore: [], missingSupporting: [], present: [] };

    // Normalize user skills for easier matching
    const rawSkills: string[] = Array.isArray(analysisData.parsedProfile.skills)
      ? (analysisData.parsedProfile.skills as any)
      : (analysisData.parsedProfile.skills as any)?.normalizedSkills?.map((s: any) => s.canonical) || [];
    const userSkills = new Set(rawSkills.map(s => s.toLowerCase()));

    const missingCore = role.coreSkills.filter(s => !userSkills.has(s.toLowerCase()));
    const missingSupporting = role.secondarySkills.filter(s => !userSkills.has(s.toLowerCase()));

    const presentCore = role.coreSkills.filter(s => userSkills.has(s.toLowerCase()));
    const presentSupporting = role.secondarySkills.filter(s => userSkills.has(s.toLowerCase()));
    const present = [...presentCore, ...presentSupporting];

    const totalWeight = (role.coreSkills.length * 2) + role.secondarySkills.length;
    if (totalWeight === 0) return { matchPercent: 100, missingCore, missingSupporting, present };

    const earnedWeight = (presentCore.length * 2) + presentSupporting.length;
    const matchPercent = Math.round((earnedWeight / totalWeight) * 100);

    return { matchPercent, missingCore, missingSupporting, present };
  };

  const getBadgeStyle = (percent: number) => {
    if (percent >= 70) return { bg: '#10B981', color: '#000000' };
    if (percent >= 40) return { bg: '#F59E0B', color: '#000000' };
    return { bg: '#EF4444', color: '#000000' };
  };

  const GlobalStyles = () => (
    <style>{`
      * {
        font-feature-settings: "zero" 0, "ss01" 0, "ss02" 0;
        font-variant-numeric: normal;
      }
      ::-webkit-scrollbar {
        height: 6px;
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #000000; 
      }
      ::-webkit-scrollbar-thumb {
        background: #2A2A2A; 
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #444444; 
      }
    `}</style>
  );

  if (!analysisData) {
    return (
      <DashboardLayout>
        <GlobalStyles />
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <div style={{ fontFamily: "inherit", fontSize: "15px", color: "#666666", textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: "#FFFFFF", marginBottom: "8px" }}>NO RESUME DATA</div>
            Run an analysis first to enable career path comparison.
            <button
              onClick={() => navigate("/upload")}
              style={{ display: "block", margin: "24px auto 0", background: "#ffffff", fontWeight: "bold", color: "#000000", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", padding: "10px 20px", borderRadius: "0px" }}
            >
              → ANALYZE RESUME
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedGaps = selectedRole ? calculateGaps(selectedRole) : null;
  const timeToClose = selectedGaps ? (selectedGaps.missingCore.length + selectedGaps.missingSupporting.length) * 40 : 0; // ~40 hrs per gap

  function formatTime(hours: number): string {
    if (hours === 0) return "0 HOURS";
    if (hours < 40) return `~${hours} HOURS`;
    if (hours < 160) return `~${Math.round(hours / 40)} WEEKS`;
    return `~${Math.round(hours / 160)} MONTHS`;
  }

  return (
    <DashboardLayout>
      <GlobalStyles />
      <div className="min-h-screen bg-black text-white pb-[100px]">

        {/* Sticky Page Header */}
        <div className="sticky top-0 bg-black border-b border-[#444444] z-10 px-6 py-4">
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              CAREER PATHS
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#FFFFFF", margin: "4px 0 8px 0", fontWeight: "normal" }}>
              Career Explorer
            </h1>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "#666666" }}>
              Compare your resume profile against target roles. See exactly what gaps you need to close.
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

          {/* Role Search Bar */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#444444", fontSize: "14px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder='Search a target role — e.g. "Staff Engineer", "AI Product Manager"'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={{
                  width: "100%",
                  background: "#050505",
                  border: isInputFocused ? "1px solid #ffffff" : "1px solid #333333",
                  color: "#FFFFFF",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "15px",
                  padding: "12px 16px 12px 40px",
                  borderRadius: "0px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#666666", marginTop: "8px" }}>
              Results update as you type
            </div>
          </div>

          {/* Suggested Roles Section */}
          <div style={{ marginTop: "32px", overflow: "hidden" }}>
            <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              SUGGESTED BASED ON YOUR RESUME
            </div>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
              {suggestedRoles.map((roleStr, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(roleStr)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#000000"; e.currentTarget.style.backgroundColor = "#ffffff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#222222"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.backgroundColor = "#050505"; }}
                  style={{
                    background: "#050505",
                    border: "1px solid #444444",
                    color: "#ffffff",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "13px",
                    padding: "8px 14px",
                    borderRadius: "0px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  {roleStr}
                </button>
              ))}
            </div>
          </div>

          {/* Main Layout */}
          <div style={{ display: "flex", gap: "24px", marginTop: "32px", flexDirection: "row" }}>

            {/* LEFT COLUMN - Role List */}
            <div style={{ width: "35%" }}>
              <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                ROLES
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {displayedRoles.length === 0 ? (
                  <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg font-inherit text-[13px] text-[#E0E0E0] p-4 text-center">
                    Select a suggested role above to reveal your skill gaps.
                  </div>
                ) : (
                  displayedRoles.map((role, idx) => {
                    const gaps = calculateGaps(role);
                    const isActive = selectedRole?.id === role.id;
                    const badgeStyle = getBadgeStyle(gaps.matchPercent);

                    return (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`bg-[#111111] border p-4 cursor-pointer relative rounded-xl shadow-lg transition-all duration-200 ${isActive ? 'border-white z-10' : 'border-white/20 z-0 hover:border-white/40'} ${idx > 0 ? 'mt-2' : ''}`}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF", paddingRight: "12px" }}>
                            {role.title}
                          </span>
                          <span style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            fontFamily: "inherit",
                            fontSize: "12px",
                            padding: "2px 6px",
                            borderRadius: "0px"
                          }}>
                            {gaps.matchPercent}%
                          </span>
                        </div>
                        <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>
                          {gaps.missingCore.length + gaps.missingSupporting.length} gaps to close
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Role Detail Panel */}
            <div style={{ width: "63%", minHeight: "300px" }}>
              {!selectedRole ? (
                <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg h-full flex items-center justify-center p-6">
                  <span style={{ fontFamily: "inherit", fontSize: "14px", color: "#E0E0E0" }}>
                    SELECT A ROLE TO SEE GAP ANALYSIS
                  </span>
                </div>
              ) : (
                  <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg p-6 h-full">
                  {/* Role Header */}
                  <div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#FFFFFF", textTransform: "uppercase", margin: "0 0 16px 0", fontWeight: "normal" }}>
                      {selectedRole.title}
                    </h2>
                    {selectedGaps && (
                      <div style={{ marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#666666", textTransform: "uppercase", marginBottom: "4px" }}>
                            MATCH SCORE
                          </div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "48px", color: getBadgeStyle(selectedGaps.matchPercent).bg, lineHeight: 1 }}>
                            {selectedGaps.matchPercent}<span style={{ fontSize: "24px" }}>%</span>
                          </div>
                        </div>
                        <div style={{ alignSelf: "flex-end", paddingBottom: "8px" }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "#666666" }}>
                            {selectedGaps.matchPercent >= 70
                              ? `Strong alignment with ${selectedGaps.missingCore.length + selectedGaps.missingSupporting.length} minor gaps to close`
                              : `Major skill gaps detected — ${selectedGaps.missingCore.length + selectedGaps.missingSupporting.length} skills missing`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gap Analysis Sections */}
                  {selectedGaps && (
                    <div>
                      {/* Core Skills Missing */}
                      {selectedGaps.missingCore.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                            CORE SKILLS — MISSING
                          </div>
                          {selectedGaps.missingCore.map(skill => (
                            <div key={skill} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #737373" }}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <span style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF" }}>{skill}</span>
                                <span style={{ border: "1px solid #EF4444", color: "#EF4444", fontFamily: "inherit", fontSize: "12px", padding: "2px 6px", borderRadius: "0px" }}>MISSING</span>
                              </div>
                              <span style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>2X WEIGHT</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Supporting Skills Missing */}
                      {selectedGaps.missingSupporting.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                            SUPPORTING SKILLS — MISSING
                          </div>
                          {selectedGaps.missingSupporting.map(skill => (
                            <div key={skill} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #737373" }}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <span style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF" }}>{skill}</span>
                                <span style={{ border: "1px solid #F59E0B", color: "#F59E0B", fontFamily: "inherit", fontSize: "12px", padding: "2px 6px", borderRadius: "0px" }}>MISSING</span>
                              </div>
                              <span style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0" }}>1X WEIGHT</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills Present */}
                      {selectedGaps.present.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#10B981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                            SKILLS YOU ALREADY HAVE
                          </div>
                          {selectedGaps.present.map(skill => (
                            <div key={skill} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #737373" }}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <span style={{ fontFamily: "inherit", fontSize: "14px", color: "#FFFFFF", opacity: 0.6 }}>{skill}</span>
                                <span style={{ border: "1px solid #10B981", color: "#10B981", fontFamily: "inherit", fontSize: "12px", padding: "2px 6px", borderRadius: "0px" }}>PRESENT</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Effort Estimate Block */}
                      <div className="bg-[#1A1A1A] border border-gray-500 p-5 mt-4 rounded-xl shadow-lg">
                        <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                          ESTIMATED GAP CLOSE TIME
                        </div>
                        <div style={{ fontFamily: "inherit", fontSize: "24px", color: "#FFFFFF", marginBottom: "8px" }}>
                          {formatTime(timeToClose)}
                        </div>
                        <div style={{ fontFamily: "inherit", fontSize: "13px", color: "#E0E0E0" }}>
                          Based on {selectedGaps.missingCore.length + selectedGaps.missingSupporting.length} skill gaps at average learning time of 40 hours per skill
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (selectedRole && selectedGaps) {
                            const roleActionData = {
                              fromCareerExplorer: true,
                              roleName: selectedRole.title,
                              matchPercent: selectedGaps.matchPercent,
                              missingCore: selectedGaps.missingCore,
                              missingSupporting: selectedGaps.missingSupporting,
                              estimatedHours: timeToClose,
                            };
                            safeStorage.setItem('careerExplorerTarget', JSON.stringify(roleActionData));
                            navigate('/action-plan', { state: { careerExplorerTarget: roleActionData } });
                          } else {
                            navigate('/action-plan');
                          }
                        }}
                        style={{
                          width: "100%",
                          marginTop: "24px",
                          background: "#ffffff",
                          color: "#000000",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          padding: "14px",
                          borderRadius: "0px",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        → BUILD ACTION PLAN FOR THIS ROLE
                      </button>

                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* Comparison Mode (Bottom Section) */}
          {comparisonRoles.length > 0 && (
            <div style={{ marginTop: "64px", marginBottom: "40px" }}>
              <div style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                ROLE COMPARISON
              </div>
              <div className="bg-[#111111] border border-white/20 rounded-xl shadow-lg overflow-hidden">
                <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
                  <thead>
                    <tr>
                      <th style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", textAlign: "left", padding: "16px", borderBottom: "2px solid #737373" }}>Role Name</th>
                      <th style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", textAlign: "center", padding: "16px", borderBottom: "2px solid #737373" }}>Match %</th>
                      <th style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", textAlign: "center", padding: "16px", borderBottom: "2px solid #737373" }}>Core Gaps</th>
                      <th style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", textAlign: "center", padding: "16px", borderBottom: "2px solid #737373" }}>Supporting Gaps</th>
                      <th style={{ fontFamily: "inherit", fontSize: "12px", color: "#E0E0E0", textTransform: "uppercase", textAlign: "right", padding: "16px", borderBottom: "2px solid #737373" }}>Est. Time</th>
                    </tr>
                  </thead>
                <tbody>
                  {comparisonRoles.map(role => {
                    const gaps = calculateGaps(role);
                    return (
                      <tr key={role.id}>
                        <td style={{ fontFamily: "inherit", fontSize: "13px", color: "#FFFFFF", padding: "16px", borderBottom: "1px solid #737373" }}>{role.title}</td>
                        <td style={{ fontFamily: "inherit", fontSize: "13px", color: "#E0E0E0", padding: "16px", borderBottom: "1px solid #737373", textAlign: "center" }}>{gaps.matchPercent}%</td>
                        <td style={{ fontFamily: "inherit", fontSize: "13px", color: "#EF4444", padding: "16px", borderBottom: "1px solid #737373", textAlign: "center" }}>{gaps.missingCore.length}</td>
                        <td style={{ fontFamily: "inherit", fontSize: "13px", color: "#F59E0B", padding: "16px", borderBottom: "1px solid #737373", textAlign: "center" }}>{gaps.missingSupporting.length}</td>
                        <td style={{ fontFamily: "inherit", fontSize: "13px", color: "#E0E0E0", padding: "16px", borderBottom: "1px solid #737373", textAlign: "right" }}>
                          {formatTime((gaps.missingCore.length + gaps.missingSupporting.length) * 40)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default CareerExplorer;
