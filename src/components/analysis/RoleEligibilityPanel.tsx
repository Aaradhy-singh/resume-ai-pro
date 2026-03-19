/**
 * Role Eligibility Panel
 * 
 * Multi-axis role readiness panel showing all 5 fit dimensions:
 * Skill Fit, Experience Fit, Project Fit, Portfolio Fit, Certification Fit
 * With reasoning text per axis.
 */

import React from 'react';

interface RoleEligibilityPanelProps {
    roleTitle: string;
    skillFit: number;
    experienceFit: number;
    projectFit: number;
    portfolioFit: number;
    certificationFit: number;
    overallMultiFactor: number;
    matchType: 'best-fit' | 'near-fit' | 'future-ready';
    multiFactorBreakdown: string;
    careerStage: string;
    className?: string;
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#6ee7b7';
    if (score >= 60) return '#86efac';
    if (score >= 40) return '#fcd34d';
    if (score >= 20) return '#fdba74';
    return '#fca5a5';
}

function getBarColor(score: number): string {
    if (score >= 80) return 'rgba(16,185,129,0.7)';
    if (score >= 60) return 'rgba(34,197,94,0.7)';
    if (score >= 40) return 'rgba(245,158,11,0.7)';
    if (score >= 20) return 'rgba(249,115,22,0.7)';
    return 'rgba(239,68,68,0.7)';
}

function getMatchTypeBadge(matchType: string): { label: string; background: string; color: string; border: string } {
    switch (matchType) {
        case 'best-fit':
            return { label: 'Best Fit', background: '#051A0A', color: '#10B981', border: '1px solid #103A1A' };
        case 'near-fit':
            return { label: 'Near Fit', background: '#1A1505', color: '#F59E0B', border: '1px solid #3A2A10' };
        default:
            return { label: 'Future Ready', background: '#1A1505', color: '#F59E0B', border: '1px solid #3A2A10' };
    }
}

function FitAxis({ label, score, description }: { label: string; score: number; description: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#9A9A9A' }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: getScoreColor(score) }}>{score}%</span>
            </div>
            <div className="w-full overflow-hidden" style={{ height: '2px', background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${Math.max(3, score)}%`, background: getBarColor(score) }}
                />
            </div>
            <p className="text-xs" style={{ color: '#5A5A5A' }}>{description}</p>
        </div>
    );
}

export const RoleEligibilityPanel: React.FC<RoleEligibilityPanelProps> = ({
    roleTitle,
    skillFit,
    experienceFit,
    projectFit,
    portfolioFit,
    certificationFit,
    overallMultiFactor,
    matchType,
    multiFactorBreakdown,
    careerStage,
    className = '',
}) => {
    const badge = getMatchTypeBadge(matchType);
    const stageLabel = careerStage.charAt(0).toUpperCase() + careerStage.slice(1).replace('-', ' ');

    const axes = [
        {
            label: 'Skill Fit',
            score: skillFit,
            description: 'How well your skills match role requirements',
        },
        {
            label: 'Experience Fit',
            score: experienceFit,
            description: 'Years of experience vs. role expectations',
        },
        {
            label: 'Project Fit',
            score: projectFit,
            description: 'Project complexity alignment with role demands',
        },
        {
            label: 'Portfolio Fit',
            score: portfolioFit,
            description: 'Portfolio strength and visibility',
        },
        {
            label: 'Certification Fit',
            score: certificationFit,
            description: 'Relevant certifications for the role',
        },
    ];

    return (
        <div
            className={className}
            style={{
                border: '1px solid #2A2A2A',
                background: '#0D0D0D',
                padding: '24px'
            }}
        >
            {/* Header */}
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
                        Role Eligibility
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>Stage: {stageLabel}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#F0F0F0' }}>
                        {overallMultiFactor}<span className="text-sm" style={{ color: '#6B6B6B' }}>%</span>
                    </div>
                    <span
                        className="inline-block mt-1"
                        style={{ ...badge, borderRadius: 0, fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px' }}
                    >
                        {badge.label}
                    </span>
                </div>
            </div>



            {/* Fit Axes */}
            <div className="space-y-4">
                {axes.map((axis, idx) => (
                    <div key={idx} style={{
                        borderBottom: idx < axes.length - 1 ? '1px solid #111111' : 'none',
                        paddingBottom: '14px'
                    }}>
                        <FitAxis {...axis} />
                    </div>
                ))}
            </div>

            {/* Stage-weighted note */}
            <div className="mt-5 pt-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                <p className="text-xs" style={{ color: '#5A5A5A' }}>
                    Weights are dynamically adjusted for <span style={{ color: '#9A9A9A', fontWeight: 500 }}>{stageLabel}</span> candidates.
                    {careerStage === 'student' && ' Projects and portfolio carry higher weight.'}
                    {careerStage === 'senior' && ' Experience and certifications carry higher weight.'}
                    {(careerStage === 'junior' || careerStage === 'mid-level') && ' Balanced weighting across all dimensions.'}
                </p>
            </div>
        </div>
    );
};

export default RoleEligibilityPanel;
