/**
 * Transparent JD Alignment Engine
 * 
 * Explainable heuristic model for JD keyword coverage and alignment scoring.
 * Each score includes full traceability: inputs, weights, computation.
 * NOW WITH CAREER STAGE CALIBRATION to prevent unfair penalization.
 * 
 * DISCLAIMER: This is a heuristic simulation, NOT real ATS prediction.
 */

import type { CareerStage } from '@/types/career-stage';
import { STAGE_WEIGHT_CONFIGS } from './stage-aware-weights';
import { ATS_CONSTANTS } from '@/lib/constants';

export interface ScoringDetail {
    score: number; // 0-100
    inputData: Record<string, unknown>;
    computation: string; // Human-readable formula explanation
    weight: number; // % contribution to overall score
}

export interface JDAlignmentInput {
    resumeText: string;
    jobDescriptionText: string;
    extractedSkills: string[];
    jdSkills: string[];
    sections: {
        name: string;
        found: boolean;
        wordCount: number;
    }[];
    actionVerbsCount: number;
    quantifiedMetricsCount: number;
    totalWords: number;
    careerStage?: CareerStage; // OPTIONAL: For stage-aware scoring
}

export interface TransparentJDAlignmentScore {
    overallScore: number;
    disclaimer: string;
    careerStage: CareerStage | null; // Stage used for scoring calibration
    stageAdjusted: boolean; // Whether stage-specific weights were applied
    factors: {
        keywordMatch: ScoringDetail;
        skillDensity: ScoringDetail;
        sectionCompleteness: ScoringDetail;
        actionVerbStrength: ScoringDetail;
        quantificationPresence: ScoringDetail;
        projectQuality?: ScoringDetail; // Student/Fresher specific
        experienceDepth?: ScoringDetail; // Mid/Senior specific
        leadership?: ScoringDetail; // Senior specific
    };
}

/**
 * Compute keyword match rate between resume and JD
 */
export function computeKeywordMatchRate(
    resumeSkills: string[],
    jdSkills: string[]
): ScoringDetail {
    const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
    const jdSet = new Set(jdSkills.map((s) => s.toLowerCase()));

    const matchedCount = [...jdSet].filter((skill) => resumeSet.has(skill)).length;
    const totalJDSkills = jdSet.size;

    const score = totalJDSkills > 0
        ? Math.round((matchedCount / totalJDSkills) * 100)
        : 0;

    return {
        score,
        inputData: {
            resumeSkills: resumeSkills.length,
            jdSkills: totalJDSkills,
            matchedSkills: matchedCount,
            matchedList: [...jdSet].filter((skill) => resumeSet.has(skill)),
        },
        computation: `(${matchedCount} matched skills / ${totalJDSkills} JD skills) × 100 = ${score}%`,
        weight: 30, // 30% of overall score
    };
}

/**
 * Compute skill density (skills per 100 words)
 */
export function computeSkillDensity(
    skillCount: number,
    totalWords: number
): ScoringDetail {
    const rawDensity = totalWords > 0 ? (skillCount / totalWords) * 100 : 0;
    const density = Math.round(rawDensity * 10) / 10; // Prevent float drift

    // Ideal range: 2-5 skills per 100 words
    let score = 0;
    if (density >= ATS_CONSTANTS.SKILL_DENSITY.MIN_IDEAL && density <= ATS_CONSTANTS.SKILL_DENSITY.MAX_IDEAL) {
        score = 100;
    } else if (density > ATS_CONSTANTS.SKILL_DENSITY.MAX_IDEAL) {
        score = Math.max(0, 100 - (density - ATS_CONSTANTS.SKILL_DENSITY.MAX_IDEAL) * ATS_CONSTANTS.SKILL_DENSITY.PENALTY_MULTIPLIER); // Penalty for over-stuffing
    } else {
        score = (density / ATS_CONSTANTS.SKILL_DENSITY.MIN_IDEAL) * 100; // Linear increase to IDEAL_MIN
    }

    score = Math.min(100, Math.max(0, Math.round(score)));

    return {
        score,
        inputData: {
            skillCount,
            totalWords,
            density: density.toFixed(2),
            idealRange: "2-5 skills per 100 words",
        },
        computation: `Density = (${skillCount} skills / ${totalWords} words) × 100 = ${density.toFixed(2)} per 100 words`,
        weight: 20,
    };
}

/**
 * Compute section completeness
 */
export function computeSectionCompleteness(
    sections: { name: string; found: boolean; wordCount: number }[]
): ScoringDetail {
    const requiredSections = ATS_CONSTANTS.REQUIRED_SECTIONS;
    const foundRequired = requiredSections.filter((req) =>
        sections.some((s) => s.found && s.name.toLowerCase().includes(req.toLowerCase()))
    ).length;

    const score = Math.round((foundRequired / requiredSections.length) * 100);

    const missingSections = requiredSections.filter(
        (req) => !sections.some((s) => s.found && s.name.toLowerCase().includes(req.toLowerCase()))
    );

    return {
        score,
        inputData: {
            requiredSections,
            foundSections: foundRequired,
            missingSections,
            allSections: sections.map((s) => ({ name: s.name, found: s.found })),
        },
        computation: `(${foundRequired} sections found / ${requiredSections.length} required) × 100 = ${score}%`,
        weight: 15,
    };
}

/**
 * Compute action verb strength
 */
export function computeActionVerbStrength(
    resumeText: string
): ScoringDetail {
    const actionVerbs = [
        "achieved", "built", "created", "designed", "developed", "engineered",
        "implemented", "improved", "launched", "led", "managed", "optimized",
        "reduced", "shipped", "scaled", "architected", "delivered", "streamlined",
    ];

    const lowercaseText = resumeText.toLowerCase();
    const verbCounts = actionVerbs.filter((verb) => lowercaseText.includes(verb)).length;

    // Ideal: 5+ unique action verbs
    const score = Math.min(100, Math.round((verbCounts / ATS_CONSTANTS.IDEAL_METRICS.UNIQUE_ACTION_VERBS) * 100));

    return {
        score,
        inputData: {
            actionVerbsFound: verbCounts,
            idealCount: `${ATS_CONSTANTS.IDEAL_METRICS.UNIQUE_ACTION_VERBS}+ unique verbs`,
            sampleVerbs: actionVerbs.slice(0, 10),
        },
        computation: `(${verbCounts} unique action verbs / ${ATS_CONSTANTS.IDEAL_METRICS.UNIQUE_ACTION_VERBS} ideal) × 100 = ${score}%`,
        weight: 15,
    };
}

/**
 * Compute quantification presence (metrics and numbers)
 */
export function computeQuantificationPresence(
    resumeText: string
): ScoringDetail {
    // Match patterns like: 50%, $1M, 10K+, 3x, etc.
    const quantificationPatterns = [
        /\d+%/g,          // Percentages: 50%
        /\d+\+/g,         // Numbers with plus: 100+
        /\d+x/gi,         // Multipliers: 3x
        /\$[\d,]+[KMB]?/g, // Money: $100K, $1M
        /\d+K\+?/g,       // Large numbers: 10K+
    ];

    const uniqueMatches = new Set<string>();

    quantificationPatterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) {
            matches.forEach(m => uniqueMatches.add(m.toLowerCase()));
        }
    });

    const totalMatches = uniqueMatches.size;

    // Ideal: 10+ quantified metrics
    const score = Math.min(100, Math.round((totalMatches / ATS_CONSTANTS.IDEAL_METRICS.QUANTIFIED_METRICS) * 100));

    return {
        score,
        inputData: {
            quantifiedMetrics: totalMatches,
            idealCount: "10+ metrics",
            patterns: ["percentages", "money amounts", "multipliers", "large numbers"],
        },
        computation: `(${totalMatches} unique metrics found / 10 ideal) × 100 = ${score}%`,
        weight: 20,
    };
}

/**
 * Compute overall transparent JD alignment score
 */
export function computeTransparentJDAlignmentScore(
    input: JDAlignmentInput
): TransparentJDAlignmentScore {
    const keywordMatch = computeKeywordMatchRate(input.extractedSkills, input.jdSkills);
    const skillDensity = computeSkillDensity(input.extractedSkills.length, input.totalWords);
    const sectionCompleteness = computeSectionCompleteness(input.sections);
    const actionVerbStrength = computeActionVerbStrength(input.resumeText);
    const quantificationPresence = computeQuantificationPresence(input.resumeText);

    // Calculate stage-aware weights if career stage is provided
    let weights = {
        keywordMatch: 30,
        skillRelevance: 20, // mapped to skillDensity
        sectionCompleteness: 15,
        actionVerbs: 15, // mapped to actionVerbStrength
        quantification: 20, // mapped to quantificationPresence
        projectQuality: 0,
        experienceDepth: 0,
        leadership: 0
    };

    if (input.careerStage) {
        // Import dynamically to avoid circular dependencies if any (though importing types is fine)
        // We assume getStageWeights is available or we define the map here if import is tricky.
        // For simplicity and robustness, I'll use the imported config.
        const stageConfig = STAGE_WEIGHT_CONFIGS[input.careerStage];
        if (stageConfig) {
            weights = stageConfig;
        }
    }

    // Compute additional factors for stage-aware scoring
    const projectQuality = computeProjectQuality(input.sections);
    const experienceDepth = computeExperienceDepth(input.sections);
    const leadership = computeLeadershipStrength(input.resumeText);

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    if (totalWeight > 0 && totalWeight !== 100) {
        for (const key in weights) {
            weights[key as keyof typeof weights] = (weights[key as keyof typeof weights] / totalWeight) * 100;
        }
    }

    // Calculate weighted overall score
    const scoreComponents = [
        { name: 'keywordMatch', score: keywordMatch.score, weight: weights.keywordMatch, contribution: keywordMatch.score * (weights.keywordMatch / 100) },
        { name: 'skillDensity', score: skillDensity.score, weight: weights.skillRelevance, contribution: skillDensity.score * (weights.skillRelevance / 100) },
        { name: 'sectionCompleteness', score: sectionCompleteness.score, weight: weights.sectionCompleteness, contribution: sectionCompleteness.score * (weights.sectionCompleteness / 100) },
        { name: 'actionVerbStrength', score: actionVerbStrength.score, weight: weights.actionVerbs, contribution: actionVerbStrength.score * (weights.actionVerbs / 100) },
        { name: 'quantificationPresence', score: quantificationPresence.score, weight: weights.quantification, contribution: quantificationPresence.score * (weights.quantification / 100) },
        { name: 'projectQuality', score: projectQuality.score, weight: weights.projectQuality, contribution: projectQuality.score * (weights.projectQuality / 100) },
        { name: 'experienceDepth', score: experienceDepth.score, weight: weights.experienceDepth, contribution: experienceDepth.score * (weights.experienceDepth / 100) },
        { name: 'leadership', score: leadership.score, weight: weights.leadership, contribution: leadership.score * (weights.leadership / 100) }
    ];

    const overallScore = Math.round(scoreComponents.reduce((acc, curr) => acc + curr.contribution, 0));

    // Update factor weights for display
    keywordMatch.weight = weights.keywordMatch;
    skillDensity.weight = weights.skillRelevance;
    sectionCompleteness.weight = weights.sectionCompleteness;
    actionVerbStrength.weight = weights.actionVerbs;
    quantificationPresence.weight = weights.quantification;

    return {
        overallScore,
        disclaimer: "This score measures keyword overlap between your resume and the job description using our rule set. It does not replicate any specific employer's ATS algorithm.",
        careerStage: input.careerStage || null,
        stageAdjusted: !!input.careerStage,
        factors: {
            keywordMatch,
            skillDensity,
            sectionCompleteness,
            actionVerbStrength,
            quantificationPresence,
            projectQuality: weights.projectQuality > 0 ? projectQuality : undefined,
            experienceDepth: weights.experienceDepth > 0 ? experienceDepth : undefined,
            leadership: weights.leadership > 0 ? leadership : undefined,
        },
    };
}

/**
 * Compute Project Quality (Heuristic)
 */
function computeProjectQuality(sections: { name: string; found: boolean; wordCount: number }[]): ScoringDetail {
    const projectSection = sections.find(s =>
        s.found && (
            s.name.toLowerCase().includes('project') ||
            s.name.toLowerCase().includes('achievement') ||
            s.name.toLowerCase().includes('portfolio')
        )
    );
    let score = 0;
    let details = "";

    if (projectSection) {
        if (projectSection.wordCount > 150) {
            score = 100;
            details = "Strong project section found (>150 words)";
        } else if (projectSection.wordCount > 50) {
            score = 75;
            details = "Project section found but could be more detailed";
        } else {
            score = 50;
            details = "Project section found but very brief";
        }
    } else {
        score = 0;
        details = "No separate 'Projects' section found";
    }

    return {
        score,
        inputData: { found: !!projectSection, wordCount: projectSection?.wordCount || 0 },
        computation: details,
        weight: 0 // Set dynamically
    };
}

/**
 * Compute Experience Depth (Heuristic)
 */
function computeExperienceDepth(sections: { name: string; found: boolean; wordCount: number }[]): ScoringDetail {
    const expSection = sections.find(s =>
        s.found && (
            s.name.toLowerCase().includes('experience') ||
            s.name.toLowerCase().includes('employment') ||
            s.name.toLowerCase().includes('work history') ||
            s.name.toLowerCase().includes('professional')
        )
    );
    let score = 0;

    if (expSection) {
        // Rough proxy: 100 words ~ 1 job entry?
        if (expSection.wordCount > 300) score = 100;
        else if (expSection.wordCount > 150) score = 75;
        else score = 50;
    }

    return {
        score,
        inputData: { found: !!expSection, wordCount: expSection?.wordCount || 0 },
        computation: expSection ? `Experience section found (${expSection.wordCount} words)` : "No Experience section",
        weight: 0
    };
}

/**
 * Compute Leadership Strength (Heuristic)
 */
function computeLeadershipStrength(text: string): ScoringDetail {
    const leadershipKeywords = ["led", "managed", "mentored", "hired", "spearheaded", "directed", "supervised", "orchestrated"];
    const matches = leadershipKeywords.filter(kw => text.toLowerCase().includes(kw));
    const score = Math.min(100, (matches.length / 3) * 100); // 3+ keywords = 100%

    return {
        score,
        inputData: { matches },
        computation: `${matches.length} leadership keywords found`,
        weight: 0
    };
}
