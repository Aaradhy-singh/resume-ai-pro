/**
 * JD Alignment Score Market Calibration Layer
 * 
 * Introduces benchmark normalization by comparing candidate scores against
 * synthetic percentile distributions for the same career stage and role target.
 * 
 * Output: Raw JD Alignment Score + Market Adjusted Score + Stage Percentile Rank
 * Example: "72 | Top 38% among students targeting AI roles."
 */

import type { CareerStage } from '@/types/career-stage';

export interface MarketCalibration {
    rawScore: number;
    marketAdjusted: number;
    stagePercentile: number;       // 0-100 (higher = better relative to stage)
    rolePercentile: number;        // 0-100 (higher = better relative to role target)
    interpretation: string;        // Human-readable summary
    benchmarkDataset: string;      // Which benchmark was used
}

/**
 * Synthetic percentile distribution for JD Alignment scores per career stage.
 * Derived from general expectations — not real market data.
 * 
 * Format: [p10, p25, p50, p75, p90] — percentile breakpoints
 */
const STAGE_BENCHMARKS: Record<CareerStage, number[]> = {
    student: [30, 42, 55, 67, 78],
    fresher: [35, 48, 58, 70, 82],
    junior: [40, 52, 63, 74, 85],
    'mid-level': [45, 58, 68, 78, 88],
    senior: [50, 62, 72, 82, 92],
};

/**
 * Synthetic percentile distribution per role target category.
 */
const ROLE_BENCHMARKS: Record<string, number[]> = {
    'Machine Learning Engineer': [38, 50, 62, 75, 87],
    'Frontend Developer': [35, 48, 60, 72, 84],
    'Backend Developer': [37, 50, 62, 73, 85],
    'Full Stack Developer': [36, 49, 61, 73, 85],
    'DevOps Engineer': [40, 52, 64, 76, 88],
    'Data Scientist': [38, 51, 63, 75, 87],
    'Data Analyst': [34, 47, 59, 71, 83],
    'Mobile Developer': [35, 48, 60, 72, 84],
    // Default fallback
    'default': [36, 49, 61, 73, 85],
};

/**
 * Compute percentile rank from a score against a distribution.
 * Uses linear interpolation between breakpoints.
 */
function computePercentile(score: number, distribution: number[]): number {
    const percentilePoints = [10, 25, 50, 75, 90];

    // Below minimum
    if (score <= distribution[0]) {
        return Math.max(1, Math.round((score / distribution[0]) * 10));
    }

    // Above maximum
    if (score >= distribution[4]) {
        return Math.min(99, Math.round(90 + ((score - distribution[4]) / (100 - distribution[4])) * 10));
    }

    // Interpolate between breakpoints
    for (let i = 0; i < distribution.length - 1; i++) {
        if (score >= distribution[i] && score < distribution[i + 1]) {
            const rangeSize = distribution[i + 1] - distribution[i];
            const position = (score - distribution[i]) / rangeSize;
            const percentileRange = percentilePoints[i + 1] - percentilePoints[i];
            return Math.round(percentilePoints[i] + position * percentileRange);
        }
    }

    return 50; // Fallback median
}

/**
 * Apply market calibration adjustment.
 * Shifts score based on stage expectations — harder stages have higher baselines.
 */
function computeMarketAdjusted(rawScore: number, stagePercentile: number): number {
    // Market adjustment: if you're above median for your stage, slight boost
    // If below, slight reduction. This contextualizes the raw score.
    const deviationFromMedian = stagePercentile - 50;
    const adjustment = Math.round(deviationFromMedian * 0.1);
    return Math.max(0, Math.min(100, rawScore + adjustment));
}

/**
 * Generate human-readable interpretation string
 */
function generateInterpretation(
    rawScore: number,
    stagePercentile: number,
    rolePercentile: number,
    stage: CareerStage,
    roleTarget?: string
): string {
    const stageLabel = stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ');
    const topPercentage = 100 - stagePercentile;

    let interpretation = `${rawScore} JD Alignment | Top ${topPercentage}% among ${stageLabel}s`;

    if (roleTarget) {
        const roleTopPercentage = 100 - rolePercentile;
        interpretation += ` targeting ${roleTarget} roles (Top ${roleTopPercentage}% in role category)`;
    }

    // Add qualitative label
    if (stagePercentile >= 75) {
        interpretation += ' — Strong position.';
    } else if (stagePercentile >= 50) {
        interpretation += ' — Above average.';
    } else if (stagePercentile >= 25) {
        interpretation += ' — Below average. Improvement recommended.';
    } else {
        interpretation += ' — Significant gaps detected. Action required.';
    }

    return interpretation;
}

/**
 * Calibrate a JD Alignment score against market benchmarks.
 * 
 * @param rawScore - The raw JD Alignment heuristic score (0-100)
 * @param stage - Candidate's career stage
 * @param roleTarget - Optional: the role the candidate is targeting
 */
export function calibrateJDAlignmentScore(
    rawScore: number,
    stage: CareerStage,
    roleTarget?: string
): MarketCalibration {
    const stageDist = STAGE_BENCHMARKS[stage];
    const roleDist = roleTarget
        ? (ROLE_BENCHMARKS[roleTarget] || ROLE_BENCHMARKS['default'])
        : ROLE_BENCHMARKS['default'];

    const stagePercentile = computePercentile(rawScore, stageDist);
    const rolePercentile = computePercentile(rawScore, roleDist);
    const marketAdjusted = computeMarketAdjusted(rawScore, stagePercentile);

    const interpretation = generateInterpretation(rawScore, stagePercentile, rolePercentile, stage, roleTarget);

    const benchmarkDataset = roleTarget
        ? `Stage: ${stage} | Role: ${roleTarget}`
        : `Stage: ${stage} | Role: General`;

    return {
        rawScore,
        marketAdjusted,
        stagePercentile,
        rolePercentile,
        interpretation,
        benchmarkDataset,
    };
}
