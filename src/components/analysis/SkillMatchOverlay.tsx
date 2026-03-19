/**
 * Skill Match Overlay
 * 
 * Visual overlap between resume skills and role requirements.
 * Green = matched, Red = missing, Yellow = partial match.
 */

import React from 'react';

interface SkillMatchOverlayProps {
    matchedSkills: {
        core: string[];
        supporting: string[];
        adjacency: string[];
    };
    missingSkills: {
        core: string[];
        supporting: string[];
        adjacency: string[];
    };
    roleTitle: string;
    className?: string;
}

function SkillBadge({ skill, status }: { skill: string; status: 'matched' | 'missing' | 'partial' }) {
    const styleMap = {
        matched: { background: '#051A0A', color: '#10B981', border: '1px solid #103A1A' },
        missing: { background: '#1A0505', color: '#EF4444', border: '1px solid #3A1010' },
        partial: { background: '#1A1505', color: '#F59E0B', border: '1px solid #3A2A10' },
    };

    const iconMap = {
        matched: '✓',
        missing: '✗',
        partial: '~',
    };

    return (
        <span
            className="inline-flex items-center gap-1"
            style={{ ...styleMap[status], borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}
        >
            <span style={{ opacity: 0.7 }}>{iconMap[status]}</span>
            {skill}
        </span>
    );
}

function SkillSection({ title, matched, missing }: { title: string; matched: string[]; missing: string[] }) {
    const total = matched.length + missing.length;
    const matchRate = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium" style={{ color: '#9A9A9A' }}>{title}</h4>
                <span className="text-xs" style={{ color: '#6B6B6B' }}>
                    {matched.length}/{total} matched ({matchRate}%)
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {matched.map((skill, i) => (
                    <SkillBadge key={`m-${i}`} skill={skill} status="matched" />
                ))}
                {missing.map((skill, i) => (
                    <SkillBadge key={`x-${i}`} skill={skill} status="missing" />
                ))}
            </div>
        </div>
    );
}

export const SkillMatchOverlay: React.FC<SkillMatchOverlayProps> = ({
    matchedSkills,
    missingSkills,
    roleTitle,
    className = '',
}) => {
    const totalMatched = matchedSkills.core.length + matchedSkills.supporting.length + matchedSkills.adjacency.length;
    const totalMissing = missingSkills.core.length + missingSkills.supporting.length + missingSkills.adjacency.length;
    const total = totalMatched + totalMissing;
    const overallMatch = total > 0 ? Math.round((totalMatched / total) * 100) : 0;

    return (
        <div
            className={className}
            style={{
                border: '1px solid #2A2A2A',
                background: '#0D0D0D',
                padding: '24px'
            }}
        >
            <div style={{
                borderBottom: '1px solid #1F1F1F',
                paddingBottom: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#F0F0F0' }}>
                        Skill Match Overlay
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>vs. {roleTitle}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#F0F0F0' }}>
                        {overallMatch}<span className="text-sm" style={{ color: '#6B6B6B' }}>%</span>
                    </div>
                    <p className="text-xs" style={{ color: '#6B6B6B' }}>{totalMatched} of {total} skills</p>
                </div>
            </div>

            {/* Visual summary bar */}
            <div className="w-full overflow-hidden mb-5 flex" style={{ height: '3px', background: '#0D0D0D' }}>
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${overallMatch}%`, background: 'rgba(16,185,129,0.6)' }}
                />
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${100 - overallMatch}%`, background: 'rgba(239,68,68,0.35)' }}
                />
            </div>

            <div className="space-y-4">
                <div style={{ borderBottom: '1px solid #111111', paddingBottom: '16px' }}>
                    <SkillSection
                        title="Core Skills (3× weight)"
                        matched={matchedSkills.core}
                        missing={missingSkills.core}
                    />
                </div>
                <div style={{ borderBottom: '1px solid #111111', paddingBottom: '16px' }}>
                    <SkillSection
                        title="Supporting Skills (1.5× weight)"
                        matched={matchedSkills.supporting}
                        missing={missingSkills.supporting}
                    />
                </div>
                <div>
                    <SkillSection
                        title="Adjacency Skills (1× weight)"
                        matched={matchedSkills.adjacency}
                        missing={missingSkills.adjacency}
                    />
                </div>
            </div>

            <div style={{
                borderTop: '1px solid #1F1F1F',
                paddingTop: '14px',
                marginTop: '8px'
            }}>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#6B6B6B' }}>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2" style={{ background: 'rgba(16,185,129,0.6)', display: 'inline-block' }} /> Matched
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2" style={{ background: 'rgba(239,68,68,0.6)', display: 'inline-block' }} /> Missing
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SkillMatchOverlay;
