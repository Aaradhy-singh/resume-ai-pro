import type { Occupation } from "./occupation-types";
import type { RoleMatch } from "./occupation-types";
import { occupations } from "./occupation-data";

/** Extract skills from resume text using keyword matching */
export function extractSkillsFromResume(resumeText: string): string[] {
  const text = resumeText.toLowerCase();
  const allSkills = new Set<string>();

  occupations.forEach((occ) => {
    [...occ.coreSkills, ...occ.secondarySkills, ...occ.tools].forEach((skill) => {
      if (text.includes(skill.toLowerCase())) {
        allSkills.add(skill);
      }
    });
  });

  return Array.from(allSkills);
}

/** Match a resume's skills against all occupations and return ranked results */
export function matchResumeToOccupations(
  resumeSkills: string[],
  maxResults = 20
): RoleMatch[] {
  const normalizedSkills = resumeSkills.map((s) => s.toLowerCase());

  const matches: RoleMatch[] = occupations.map((occ) => {
    const allOccSkills = [...occ.coreSkills, ...occ.secondarySkills, ...occ.tools];
    const coreNorm = occ.coreSkills.map((s) => s.toLowerCase());
    const secondaryNorm = occ.secondarySkills.map((s) => s.toLowerCase());
    const allNorm = allOccSkills.map((s) => s.toLowerCase());

    const matchedSkills = allOccSkills.filter((s) =>
      normalizedSkills.includes(s.toLowerCase())
    );
    const missingCore = occ.coreSkills.filter(
      (s) => !normalizedSkills.includes(s.toLowerCase())
    );
    const missingSecondary = occ.secondarySkills.filter(
      (s) => !normalizedSkills.includes(s.toLowerCase())
    );

    // Weighted scoring: core skills worth 3x, secondary 1.5x, tools 1x
    const coreMatches = coreNorm.filter((s) => normalizedSkills.includes(s)).length;
    const secondaryMatches = secondaryNorm.filter((s) => normalizedSkills.includes(s)).length;
    const toolMatches = occ.tools.filter((t) =>
      normalizedSkills.includes(t.toLowerCase())
    ).length;

    const maxCoreScore = coreNorm.length * 3;
    const maxSecondaryScore = secondaryNorm.length * 1.5;
    const maxToolScore = occ.tools.length;
    const maxTotal = maxCoreScore + maxSecondaryScore + maxToolScore;

    const actualScore = coreMatches * 3 + secondaryMatches * 1.5 + toolMatches;
    const matchScore = maxTotal > 0 ? Math.round((actualScore / maxTotal) * 100) : 0;

    // Classify match type
    let matchType: RoleMatch["matchType"] = "future-ready";
    if (matchScore >= 50) matchType = "best-fit";
    else if (matchScore >= 25) matchType = "near-fit";

    // Generate upskilling suggestions
    const upskillingSuggestions = missingCore
      .slice(0, 3)
      .map((skill) => `Learn ${skill} to strengthen your fit for ${occ.title}`);

    return {
      occupation: occ,
      matchScore,
      matchedSkills,
      missingCoreSkills: missingCore,
      missingSecondarySkills: missingSecondary,
      matchType,
      upskillingSuggestions,
    };
  });

  // Sort by match score descending, then by demand level
  const demandOrder: Record<string, number> = {
    "very-high": 5,
    high: 4,
    moderate: 3,
    emerging: 2,
    niche: 1,
  };

  return matches
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (
        (demandOrder[b.occupation.demandLevel] || 0) -
        (demandOrder[a.occupation.demandLevel] || 0)
      );
    })
    .slice(0, maxResults);
}

/** Get role recommendations categorized by fit type */
export function getRoleRecommendations(resumeSkills: string[]) {
  const allMatches = matchResumeToOccupations(resumeSkills, 50);

  return {
    bestFit: allMatches.filter((m) => m.matchType === "best-fit").slice(0, 10),
    nearFit: allMatches.filter((m) => m.matchType === "near-fit").slice(0, 10),
    futureReady: allMatches.filter((m) => m.matchType === "future-ready" && m.occupation.isFutureReady).slice(0, 10),
  };
}

/** Calculate resume readiness score for a specific occupation */
export function getResumeReadinessScore(
  resumeSkills: string[],
  occupation: Occupation
): number {
  const normalizedSkills = resumeSkills.map((s) => s.toLowerCase());
  const coreMatches = occupation.coreSkills.filter((s) =>
    normalizedSkills.includes(s.toLowerCase())
  ).length;
  const totalCore = occupation.coreSkills.length;
  return totalCore > 0 ? Math.round((coreMatches / totalCore) * 100) : 0;
}
