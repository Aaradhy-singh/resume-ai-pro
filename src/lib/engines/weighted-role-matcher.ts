/**
 * Weighted Role Matcher
 * 
 * Sophisticated role matching using weighted skill requirements
 * instead of flat percentage calculations.
 */

import type { NormalizedSkill } from "./skill-normalizer";
import type { WeightedOccupation, WeightedSkill } from "./occupation-data-weighted";
import { OCCUPATION_DATA } from "./occupation-data-weighted";
import type { CareerStage } from '@/types/career-stage';
import { MATCH_THRESHOLDS } from "../constants";

/** Context for multi-factor scoring (passed from orchestrator) */
export interface MultiFactorContext {
    careerStage: CareerStage;
    totalExperienceYears: number | null;
    projectComplexityScore: number;   // 0-100 from project-complexity-analyzer
    portfolioScore: number;            // 0-100 from portfolio analysis
    certificationCount: number;
    relevantCertifications: string[];
}

export interface RoleMatch {
    occupation: WeightedOccupation;

    /** Overall weighted match score (0-100) */
    matchScore: number;

    /** Missing skills by category */
    missingCrucialSkills: string[];

    /** Match classification */
    matchType: "best-fit" | "near-fit" | "future-ready";

    /** Upskilling suggestions */
    upskillingSuggestions: string[];

    /** Detailed score explanation */
    scoreExplanation: {
        corePoints: number;
        maxCorePoints: number;
        supportingPoints: number;
        maxSupportingPoints: number;
        adjacencyPoints: number;
        maxAdjacencyPoints: number;
        totalPoints: number;
        maxTotalPoints: number;
    };

    /** Added for data enrichment */
    salaryRange?: string;
    complexityBonus?: number;

    /** Added by Role Seniority Filter */
    seniority?: "intern" | "entry" | "junior" | "mid" | "senior" | "lead" | "staff" | "principal";
    fitLevel?: "perfect" | "reach" | "stretch" | "mismatch";
    seniorityReason?: string;
}

/**
 * Match normalized skills against a weighted occupation
 */
export function matchSkillsToWeightedRole(
    userSkills: NormalizedSkill[],
    role: WeightedOccupation,
    context?: MultiFactorContext
): RoleMatch {
    const candidateSkillSet = new Set(userSkills.map((s) => s.canonical.toLowerCase()));

    const allWeightedSkills = [
        ...(role.coreSkillsWeighted ?? []),
        ...(role.supportingSkillsWeighted ?? []),
        ...(role.adjacencySkillsWeighted ?? []),
    ];

    let matchedWeight = 0;
    let totalWeight = 0;
    let missingCrucial: string[] = [];

    allWeightedSkills.forEach(ws => {
        totalWeight += ws.weight;
        if (candidateSkillSet.has(ws.skill.toLowerCase())) {
            matchedWeight += ws.weight;
        } else if (ws.importance === 'core') {
            missingCrucial.push(ws.skill);
        }
    });

    // For students, limit missing crucial skills shown to top 3 most learnable
    if (context?.careerStage === 'student' || context?.careerStage === 'fresher') {
      missingCrucial = missingCrucial.slice(0, 3);
    }

    const matchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
    
    // Apply career stage floor for students and freshers
    let adjustedScore = matchScore;
    if (context?.careerStage === 'student' || context?.careerStage === 'fresher') {
      adjustedScore = Math.round(matchScore * 1.2);
      adjustedScore = Math.min(adjustedScore, 75); // Cap at 75 — students shouldn't show 90%+ match
    }
    const finalScore = Math.min(100, adjustedScore);

    // Determine match type
    let matchType: "best-fit" | "near-fit" | "future-ready" = "future-ready";
    if (finalScore >= MATCH_THRESHOLDS.BEST_FIT_WEIGHTED_SCORE) {
        matchType = "best-fit";
    } else if (finalScore >= MATCH_THRESHOLDS.NEAR_FIT_WEIGHTED_SCORE) {
        matchType = "near-fit";
    }

    // Generate upskilling suggestions
    const upskillingSuggestions: string[] = [];
    if (missingCrucial.length > 0) {
        upskillingSuggestions.push(
            `Master core skills: ${missingCrucial.slice(0, 3).join(", ")}`
        );
    }

    return {
        occupation: role,
        matchScore: finalScore,
        missingCrucialSkills: missingCrucial,
        matchType,
        upskillingSuggestions,
        salaryRange: role.salaryBand ? `$${role.salaryBand.min}k - $${role.salaryBand.max}k` : 'N/A',
        complexityBonus: 0,
        scoreExplanation: {
            corePoints: matchedWeight, // Approximate for backward compatibility
            maxCorePoints: totalWeight,
            supportingPoints: 0,
            maxSupportingPoints: 0,
            adjacencyPoints: 0,
            maxAdjacencyPoints: 0,
            totalPoints: matchedWeight,
            maxTotalPoints: totalWeight,
        },
    };
}

/**
 * Dynamic weights by career stage.
 * Students: project/portfolio matter more.
 * Seniors: experience/leadership matter more.
 */
const STAGE_WEIGHTS: Record<CareerStage, {
    skill: number; experience: number; project: number; portfolio: number; certification: number;
}> = {
    student: { skill: 30, experience: 5, project: 30, portfolio: 25, certification: 10 },
    fresher: { skill: 30, experience: 15, project: 25, portfolio: 20, certification: 10 },
    junior: { skill: 30, experience: 25, project: 20, portfolio: 15, certification: 10 },
    'mid-level': { skill: 25, experience: 30, project: 15, portfolio: 15, certification: 15 },
    senior: { skill: 20, experience: 35, project: 10, portfolio: 10, certification: 25 },
};

/**
 * Match user skills against all weighted occupations and return top matches
 */
export function matchToAllWeightedRoles(
    userSkills: NormalizedSkill[],
    maxResults = 20,
    context?: MultiFactorContext
): RoleMatch[] {
    const matches = OCCUPATION_DATA.map((occ) =>
        matchSkillsToWeightedRole(userSkills, occ, context)
    );

    // Sort by weighted score (primary) and core skill match (secondary)
    return matches
        .filter((m) => m.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.missingCrucialSkills.length - b.missingCrucialSkills.length; // Fallback
        })
        .slice(0, maxResults);
}

/**
 * Get role recommendations categorized by fit type
 */
export function getWeightedRoleRecommendations(
    userSkills: NormalizedSkill[],
    context?: MultiFactorContext
): {
    bestFit: RoleMatch[];
    nearFit: RoleMatch[];
    futureReady: RoleMatch[];
} {
    const allMatches = matchToAllWeightedRoles(userSkills, 50, context);

    return {
        bestFit: allMatches.filter((m) => m.matchType === "best-fit"),
        nearFit: allMatches.filter((m) => m.matchType === "near-fit"),
        futureReady: allMatches.filter(
            (m) => m.matchType === "future-ready" && m.occupation.isFutureReady
        ),
    };
}

/**
 * Explain how a weighted score was calculated
 */
export function explainWeightedScore(match: RoleMatch): string {
    const { scoreExplanation } = match;

    return `
Weighted Score Calculation for ${match.occupation.title}:

Core Skills:
  Matched: ${scoreExplanation.maxCorePoints > 0 ? Math.round((scoreExplanation.corePoints / scoreExplanation.maxCorePoints) * 100) : 0}%
  Points: ${scoreExplanation.corePoints} / ${scoreExplanation.maxCorePoints}

Total Weighted Score:
  ${scoreExplanation.totalPoints} / ${scoreExplanation.maxTotalPoints} = ${match.matchScore}%
  
Match Type: ${match.matchType}
`.trim();
}

