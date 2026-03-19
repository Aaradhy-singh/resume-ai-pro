import { useState } from 'react';
import type { AnalysisResult } from '@/lib/engines/analysis-orchestrator';
import type { RoleMatch } from '@/lib/engines/weighted-role-matcher';

interface Props {
  analysisData: AnalysisResult | null;
}

const matchTypeColors: Record<string, string> = {
  'best-fit': '#10B981',
  'near-fit': '#0EA5E9',
  'future-ready': '#F59E0B',
};

const matchTypeLabels: Record<string, string> = {
  'best-fit': 'BEST FIT',
  'near-fit': 'NEAR FIT',
  'future-ready': 'FUTURE READY',
};

export function RoleRecommendations({ analysisData }: Props) {
  const [selectedRole, setSelectedRole] = useState<RoleMatch | null>(null);

  if (!analysisData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        gap: '16px'
      }}>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '11px',
          color: '#3A3A3A',
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}>NO ANALYSIS DATA</p>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '12px',
          color: '#6B6B6B',
          textAlign: 'center',
          maxWidth: '320px',
          lineHeight: 1.8
        }}>
          Upload your resume and run analysis first.
          Your role matches will appear here automatically.
        </p>
        <button
          onClick={() => { window.location.href = '/upload'; }}
          style={{
            background: '#0EA5E9',
            color: '#000',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '12px 28px',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer'
          }}
        >
          GO TO UPLOAD
        </button>
      </div>
    );
  }

  const roles = analysisData.roles.stageFiltered.slice(0, 12);
  const topMatch = analysisData.roles.topRoles[0];
  const careerStage = analysisData.careerStage.stage;
  const userSkills = analysisData.parsedProfile.skills.normalizedSkills.map(s => s.canonical);

  return (
    <div>
      {/* Career stage context banner */}
      <div style={{
        background: '#0D0D0D',
        border: '1px solid #1F1F1F',
        borderLeft: '3px solid #0EA5E9',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>YOUR CAREER STAGE</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{careerStage.replace(/-/g, ' ')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>ROLES MATCHED</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: '#F0F0F0' }}>{roles.length} roles</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>SKILLS DETECTED</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: '#F0F0F0' }}>{userSkills.length} skills</p>
        </div>
      </div>

      {/* Top match highlight */}
      {topMatch && (
        <div style={{
          background: '#0A1A0A',
          border: '1px solid #1A3A1A',
          borderLeft: '3px solid #10B981',
          padding: '20px 24px',
          marginBottom: '24px'
        }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#10B981', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>✓ TOP MATCH FOR YOUR PROFILE</p>
          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: '#F0F0F0', fontWeight: 400, marginBottom: '12px' }}>{topMatch.occupation.title}</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: topMatch.missingCrucialSkills.length > 0 ? '12px' : '0' }}>
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>MATCH SCORE</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '20px', color: '#10B981' }}>{topMatch.matchScore}%</p>
            </div>
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>CORE SKILLS</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '20px', color: '#F0F0F0' }}>{topMatch.matchScore}%</p>
            </div>
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>SKILLS TO ADD</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '20px', color: '#F0F0F0' }}>{topMatch.missingCrucialSkills.length}</p>
            </div>
          </div>
          {topMatch.missingCrucialSkills.length > 0 && (
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>MISSING CORE SKILLS</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {topMatch.missingCrucialSkills.slice(0, 6).map(skill => (
                  <span key={skill} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#EF4444', background: '#1A0808', border: '1px solid #3A1A1A', padding: '3px 8px' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role grid — grouped by match type */}
      {(['best-fit', 'near-fit', 'future-ready'] as const).map(matchType => {
        const typeRoles = roles.filter(r => r.matchType === matchType);
        if (typeRoles.length === 0) return null;
        return (
          <div key={matchType} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #1F1F1F' }}>
              <span style={{ width: '8px', height: '8px', background: matchTypeColors[matchType], display: 'inline-block' }} />
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: matchTypeColors[matchType], letterSpacing: '0.2em', textTransform: 'uppercase' }}>{matchTypeLabels[matchType]}</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#3A3A3A' }}>({typeRoles.length})</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
              {typeRoles.map(role => (
                <div
                  key={role.occupation.id}
                  onClick={() => setSelectedRole(selectedRole?.occupation.id === role.occupation.id ? null : role)}
                  style={{
                    background: selectedRole?.occupation.id === role.occupation.id ? '#141414' : '#0D0D0D',
                    border: selectedRole?.occupation.id === role.occupation.id
                      ? `1px solid ${matchTypeColors[matchType]}`
                      : '1px solid #1F1F1F',
                    borderLeft: `3px solid ${matchTypeColors[matchType]}`,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#F0F0F0', fontWeight: 500, flex: 1, paddingRight: '8px' }}>{role.occupation.title}</p>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '16px', color: matchTypeColors[matchType], fontWeight: 300, minWidth: '42px', textAlign: 'right' }}>{role.matchScore}%</p>
                  </div>
                  <div style={{ height: '2px', background: '#1A1A1A', marginBottom: '10px' }}>
                    <div style={{ height: '2px', width: `${role.matchScore}%`, background: matchTypeColors[matchType], opacity: 0.6 }} />
                  </div>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B' }}>
                    Core: {role.matchScore}% · Missing: {role.missingCrucialSkills.length} skills
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Selected role detail panel */}
      {selectedRole && (
        <div style={{ marginTop: '32px', background: '#111111', border: '1px solid #1F1F1F', borderTop: `3px solid ${matchTypeColors[selectedRole.matchType]}` }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F1F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: '#F0F0F0', fontWeight: 400 }}>{selectedRole.occupation.title}</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#6B6B6B', marginTop: '4px' }}>Match Score: {selectedRole.matchScore}%</p>
            </div>
            <button
              onClick={() => setSelectedRole(null)}
              style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#6B6B6B', fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '6px 14px', cursor: 'pointer', borderRadius: 0 }}
            >CLOSE</button>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {/* Missing skills */}
            <div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#EF4444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                YOU NEED ({selectedRole.missingCrucialSkills.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {selectedRole.missingCrucialSkills.map(skill => (
                  <span key={skill} style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#EF4444', background: '#1A0808', border: '1px solid #3A1A1A', padding: '3px 8px' }}>{skill}</span>
                ))}
              </div>
              {selectedRole.upskillingSuggestions.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>SUGGESTED NEXT STEPS</p>
                  {selectedRole.upskillingSuggestions.slice(0, 3).map((s, i) => (
                    <p key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#6B6B6B', lineHeight: 1.7 }}>→ {s}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
