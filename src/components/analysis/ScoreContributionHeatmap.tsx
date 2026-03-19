/**
 * Score Contribution Heatmap
 * 
 * Visual heatmap showing which ATS factors contribute most,
 * color-coded by factor weight × score for explainability.
 */

import React from 'react';

interface ScoringFactor {
    name: string;
    score: number;    // 0-100
    weight: number;   // percentage weight
    maxPoints: number;
}

interface ScoreContributionHeatmapProps {
    factors: ScoringFactor[];
    overallScore: number;
    className?: string;
}

function getHeatStyle(score: number): { background: string; border: string; color: string } {
    if (score >= 80) return { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' };
    if (score >= 60) return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' };
    if (score >= 40) return { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' };
    if (score >= 20) return { background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#fdba74' };
    return { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' };
}

function getBarWidth(score: number): string {
    return `${Math.max(4, Math.min(100, score))}%`;
}

export const ScoreContributionHeatmap: React.FC<ScoreContributionHeatmapProps> = ({
    factors,
    overallScore,
    className = '',
}) => {
    // Sort factors by contribution (weight × score) descending
    const sortedFactors = [...factors].sort(
        (a, b) => (b.weight * b.score) - (a.weight * a.score)
    );

    return (
        <div
            className={className}
            style={{ border: '1px solid #1F1F1F', background: '#1A1A1A', padding: '20px' }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#F0F0F0' }}>
                    Score Contribution Heatmap
                </h3>
                <div className="text-2xl font-bold" style={{ color: '#F0F0F0' }}>
                    {overallScore}<span className="text-sm" style={{ color: '#6B6B6B' }}>/100</span>
                </div>
            </div>

            <div className="space-y-3">
                {sortedFactors.map((factor, idx) => {
                    const contribution = Math.round((factor.weight * factor.score) / 100);
                    const heatStyle = getHeatStyle(factor.score);

                    return (
                        <div key={idx} style={{ ...heatStyle, padding: '12px', borderRadius: 0 }}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium" style={{ color: heatStyle.color }}>{factor.name}</span>
                                <span className="text-xs" style={{ opacity: 0.8, color: heatStyle.color }}>
                                    {factor.score}% × {factor.weight}w = {contribution} pts
                                </span>
                            </div>
                            <div className="w-full overflow-hidden" style={{ height: '2px', background: 'rgba(0,0,0,0.3)' }}>
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{ width: getBarWidth(factor.score), background: heatStyle.color, opacity: 0.6 }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1F1F1F' }}>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>
                    Factors sorted by contribution (weight × score). Warmer colors indicate areas needing improvement.
                </p>
            </div>
        </div>
    );
};

export default ScoreContributionHeatmap;
