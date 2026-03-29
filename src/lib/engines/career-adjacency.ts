/**
 * Career Adjacency Engine
 * 
 * Maps career pathways and computes role adjacency based on
 * weighted skill overlap for career transition recommendations.
 */

import type { WeightedOccupation, WeightedSkill } from "./occupation-data-weighted";
import { weightedOccupations } from "./occupation-data-weighted";
import { MATCH_THRESHOLDS } from "../constants";

export interface CareerPathway {
    pathwayId: string;
    name: string;
    roles: string[]; // Occupation IDs in progression order
    description: string;
}

export interface AdjacentRoleMatch {
    occupation: WeightedOccupation;
    adjacencyScore: number; // 0-100, how similar to current role
    sharedSkills: string[];
    transitionSkillGap: string[];
    transitionDifficulty: "easy" | "moderate" | "challenging";
    estimatedTransitionGap: string; // Replaced time estimates with gap count
    pathwayContext?: string; // Which career pathway this fits into
}

export interface SkillGapAnalysis {
    from: WeightedOccupation;
    to: WeightedOccupation;
    skillsToAcquire: {
        core: string[];
        supporting: string[];
    };
    skillsAlreadyHave: string[];
    gapPercentage: number; // 0-100, how much is missing
    prioritizedLearningPath: string[];
}

/**
 * Predefined career pathways
 */
export const careerPathways: CareerPathway[] = [
    {
        pathwayId: "data-progression",
        name: "Data Career Progression",
        roles: ["data-analyst-mid", "data-scientist-mid", "ml-engineer-mid"],
        description: "Traditional progression from analysis to modeling to ML engineering",
    },
    {
        pathwayId: "web-fullstack",
        name: "Full Stack Web Development",
        roles: ["frontend-dev-mid", "fullstack-dev-mid", "backend-dev-mid"],
        description: "Web development roles with overlapping skill sets",
    },
    {
        pathwayId: "infrastructure",
        name: "Infrastructure & DevOps",
        roles: ["backend-dev-mid", "devops-engineer-mid"],
        description: "Backend development to infrastructure automation",
    },
];

/**
 * Compute adjacency score between two roles based on weighted skill overlap
 */
export function computeRoleAdjacency(
    role1: WeightedOccupation,
    role2: WeightedOccupation
): number {
    const getAllSkills = (occ: WeightedOccupation): WeightedSkill[] => [
        ...occ.coreSkillsWeighted,
        ...occ.supportingSkillsWeighted,
        ...occ.adjacencySkillsWeighted,
    ];

    const skills1 = getAllSkills(role1);
    const skills2 = getAllSkills(role2);

    const skillSet1 = new Map(skills1.map((ws) => [ws.skill.toLowerCase(), ws.weight]));
    const skillSet2 = new Map(skills2.map((ws) => [ws.skill.toLowerCase(), ws.weight]));

    // Calculate weighted overlap
    let overlapPoints = 0;
    let maxPossiblePoints = 0;

    skills1.forEach((ws) => {
        const weight2 = skillSet2.get(ws.skill.toLowerCase());
        if (weight2 !== undefined) {
            // Shared skill: use average weight
            overlapPoints += (ws.weight + weight2) / 2;
        }
        maxPossiblePoints += ws.weight;
    });

    skills2.forEach((ws) => {
        if (!skillSet1.has(ws.skill.toLowerCase())) {
            maxPossiblePoints += ws.weight;
        }
    });

    return maxPossiblePoints > 0 ? Math.round((overlapPoints / maxPossiblePoints) * 100) : 0;
}

/**
 * Get adjacent roles for a given occupation (exported for use in Career Explorer)
 */
export function getAdjacentRoles(
    currentRole: WeightedOccupation,
    allRoles: WeightedOccupation[] = weightedOccupations,
    minAdjacencyScore = MATCH_THRESHOLDS.MIN_ADJACENCY_SCORE
): AdjacentRoleMatch[] {
    const adjacentMatches: AdjacentRoleMatch[] = [];

    allRoles.forEach((role) => {
        if (role.id === currentRole.id) return; // Skip self

        const adjacencyScore = computeRoleAdjacency(currentRole, role);

        if (adjacencyScore >= minAdjacencyScore) {
            const gap = calculateSkillGap(currentRole, role);

            // Determine transition difficulty
            let transitionDifficulty: "easy" | "moderate" | "challenging" = "challenging";
            if (gap.gapPercentage <= 20) {
                transitionDifficulty = "easy";
            } else if (gap.gapPercentage <= 50) {
                transitionDifficulty = "moderate";
            }

            // Estimate transition effort by gap count
            const estimatedTransitionGap = `${gap.prioritizedLearningPath.length} skills to acquire based on our database`;

            // Check if in common pathway
            const pathway = careerPathways.find((p) =>
                p.roles.includes(currentRole.id) && p.roles.includes(role.id)
            );

            adjacentMatches.push({
                occupation: role,
                adjacencyScore,
                sharedSkills: gap.skillsAlreadyHave,
                transitionSkillGap: gap.prioritizedLearningPath,
                transitionDifficulty,
                estimatedTransitionGap,
                pathwayContext: pathway?.name,
            });
        }
    });

    // Sort by adjacency score
    const sorted = adjacentMatches.sort((a, b) => b.adjacencyScore - a.adjacencyScore);

    // Normalize probabilities if needed (ensure within 0-100 and no NaN)
    return sorted.map(match => ({
        ...match,
        adjacencyScore: isNaN(match.adjacencyScore) ? 0 : Math.max(0, Math.min(100, Math.round(match.adjacencyScore)))
    }));
}

/**
 * Calculate detailed skill gap between two roles
 */
export function calculateSkillGap(
    fromRole: WeightedOccupation,
    toRole: WeightedOccupation
): SkillGapAnalysis {
    const currentSkills = new Set([
        ...fromRole.coreSkillsWeighted.map((ws) => ws.skill.toLowerCase()),
        ...fromRole.supportingSkillsWeighted.map((ws) => ws.skill.toLowerCase()),
        ...fromRole.adjacencySkillsWeighted.map((ws) => ws.skill.toLowerCase()),
    ]);

    const targetCoreSkills = toRole.coreSkillsWeighted.map((ws) => ws.skill);
    const targetSupportingSkills = toRole.supportingSkillsWeighted.map((ws) => ws.skill);

    const missingCore = targetCoreSkills.filter(
        (skill) => !currentSkills.has(skill.toLowerCase())
    );
    const missingSupporting = targetSupportingSkills.filter(
        (skill) => !currentSkills.has(skill.toLowerCase())
    );

    const alreadyHave = [
        ...targetCoreSkills.filter((skill) => currentSkills.has(skill.toLowerCase())),
        ...targetSupportingSkills.filter((skill) => currentSkills.has(skill.toLowerCase())),
    ];

    const totalRequired = targetCoreSkills.length + targetSupportingSkills.length;
    const gapPercentage = totalRequired > 0
        ? Math.round(((missingCore.length + missingSupporting.length) / totalRequired) * 100)
        : 0;

    // Prioritized learning path: core skills first
    const prioritizedLearningPath = [...missingCore, ...missingSupporting];

    return {
        from: fromRole,
        to: toRole,
        skillsToAcquire: {
            core: missingCore,
            supporting: missingSupporting,
        },
        skillsAlreadyHave: alreadyHave,
        gapPercentage,
        prioritizedLearningPath,
    };
}

/**
 * Get career progression recommendation based on pathways
 */
function getCareerProgressionSuggestion(
    currentRoleId: string
): CareerPathway[] {
    return careerPathways.filter((pathway) => pathway.roles.includes(currentRoleId));
}
