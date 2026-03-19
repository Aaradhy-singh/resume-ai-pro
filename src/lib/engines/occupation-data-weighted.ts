import type { Occupation, ExperienceLevel } from "../occupation-types";
import { CORE_SKILL_WEIGHT, SUPPORTING_SKILL_WEIGHT, ADJACENCY_SKILL_WEIGHT } from "../constants";
import { occupations } from '../occupation-data';

export interface WeightedSkill {
    skill: string; // Canonical skill name from ontology
    weight: number; // Importance weight (typically 1, 1.5, or 3)
    importance: "core" | "supporting" | "adjacency";
}

export interface WeightedOccupation extends Omit<Occupation, 'coreSkills' | 'secondarySkills' | 'tools'> {
    /** Core skills with high weight (×3) - absolutely essential */
    coreSkillsWeighted: WeightedSkill[];

    /** Supporting skills with medium weight (×1.5) - important but not critical */
    supportingSkillsWeighted: WeightedSkill[];

    /** Adjacency skills with low weight (×1) - nice to have */
    adjacencySkillsWeighted: WeightedSkill[];
}

/**
 * Weighted Occupation Database
 * Mapped dynamically from the full occupation dataset
 */
export const OCCUPATION_DATA: WeightedOccupation[] = occupations.map(occ => ({
  ...occ,
  coreSkillsWeighted: occ.coreSkills.map(skill => ({
    skill,
    weight: 3,
    importance: 'core' as const,
  })),
  supportingSkillsWeighted: occ.secondarySkills.map(skill => ({
    skill,
    weight: 1.5,
    importance: 'supporting' as const,
  })),
  adjacencySkillsWeighted: occ.tools.map(skill => ({
    skill,
    weight: 1,
    importance: 'adjacency' as const,
  })),
}));

// Alias for backward compatibility
export const weightedOccupations = OCCUPATION_DATA;

/**
 * Helper to convert weighted occupation to legacy Occupation format
 * (for backward compatibility with existing code)
 */
function toLegacyOccupation(weighted: WeightedOccupation): Occupation {
    return {
        ...weighted,
        coreSkills: weighted.coreSkillsWeighted.map((ws) => ws.skill),
        secondarySkills: weighted.supportingSkillsWeighted.map((ws) => ws.skill),
        tools: weighted.adjacencySkillsWeighted.map((ws) => ws.skill),
    };
}
