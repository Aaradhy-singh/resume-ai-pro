/**
 * Role Seniority Taxonomy & Filtering
 * Prevents mismatches: students → senior roles, seniors → internships
 */

import type { CareerStage } from '@/types/career-stage';

export type RoleSeniority =
    | 'intern'
    | 'entry'
    | 'junior'
    | 'mid'
    | 'senior'
    | 'lead'
    | 'staff'
    | 'principal';

interface RoleWithSeniority {
    title: string;
    seniority: RoleSeniority;
    minYears: number;
    maxYears: number | null; // null = no max
    keywords: string[]; // For detection
}

/**
 * Role seniority configuration
 */
export const ROLE_SENIORITY_MAP: Record<RoleSeniority, {
    minYears: number;
    maxYears: number | null;
    allowedStages: CareerStage[];
    description: string;
}> = {
    intern: {
        minYears: 0,
        maxYears: 0,
        allowedStages: ['student'],
        description: 'Internship or co-op position',
    },
    entry: {
        minYears: 0,
        maxYears: 2,
        allowedStages: ['student', 'fresher', 'junior'],
        description: 'Entry-level or graduate position',
    },
    junior: {
        minYears: 1,
        maxYears: 3,
        allowedStages: ['fresher', 'junior'],
        description: 'Junior individual contributor role',
    },
    mid: {
        minYears: 3,
        maxYears: 7,
        allowedStages: ['junior', 'mid-level'],
        description: 'Mid-level individual contributor',
    },
    senior: {
        minYears: 5,
        maxYears: null,
        allowedStages: ['mid-level', 'senior'],
        description: 'Senior individual contributor',
    },
    lead: {
        minYears: 7,
        maxYears: null,
        allowedStages: ['senior'],
        description: 'Technical lead or team lead',
    },
    staff: {
        minYears: 8,
        maxYears: null,
        allowedStages: ['senior'],
        description: 'Staff engineer or equivalent',
    },
    principal: {
        minYears: 10,
        maxYears: null,
        allowedStages: ['senior'],
        description: 'Principal engineer or distinguished engineer',
    },
};

/**
 * Detect role seniority from title
 */
export function detectRoleSeniority(roleTitle: string): RoleSeniority {
    const normalized = roleTitle.toLowerCase();

    // Check in order of specificity (most specific first)
    if (/\b(principal|distinguished)\b/.test(normalized)) return 'principal';
    if (/\bstaff\s+engineer\b/.test(normalized)) return 'staff';
    if (/\b(lead|tech\s+lead|technical\s+lead)\b/.test(normalized)) return 'lead';
    if (/\bsenior\b/.test(normalized)) return 'senior';
    if (/\bmid\s*-?\s*level\b/.test(normalized)) return 'mid';
    if (/\bjunior\b/.test(normalized)) return 'junior';
    if (/\b(intern|internship|co-?op)\b/.test(normalized)) return 'intern';
    if (/\b(entry|graduate|associate)\b/.test(normalized)) return 'entry';

    // Default: mid-level if no markers
    return 'mid';
}

/**
 * Check if a role is appropriate for a career stage
 */
export function isRoleAppropriateForStage(
    roleSeniority: RoleSeniority,
    candidateStage: CareerStage
): { appropriate: boolean; reason?: string } {
    const seniority = ROLE_SENIORITY_MAP[roleSeniority];
    const appropriate = seniority.allowedStages.includes(candidateStage);

    if (!appropriate) {
        if (candidateStage === 'student' || candidateStage === 'fresher') {
            return {
                appropriate: false,
                reason: `This is a ${seniority.description} requiring ${seniority.minYears}+ years. Consider entry-level or intern roles instead.`,
            };
        } else {
            return {
                appropriate: false,
                reason: `This role may be too ${roleSeniority === 'intern' || roleSeniority === 'entry' ? 'junior' : 'senior'} for your experience level.`,
            };
        }
    }

    return { appropriate: true };
}

/**
 * Filter roles based on career stage
 */
export function filterRolesByStage<T extends { title: string }>(
    roles: T[],
    candidateStage: CareerStage
): Array<T & { seniority: RoleSeniority; fitLevel: 'perfect' | 'reach' | 'stretch' | 'mismatch'; seniorityReason?: string }> {
    return roles.map(role => {
        const seniority = detectRoleSeniority(role.title);
        const { appropriate, reason } = isRoleAppropriateForStage(seniority, candidateStage);

        // Determine fit level
        let fitLevel: 'perfect' | 'reach' | 'stretch' | 'mismatch';
        const seniorityConfig = ROLE_SENIORITY_MAP[seniority];

        if (seniorityConfig.allowedStages.includes(candidateStage)) {
            // Check if it's the primary stage or reach
            const primaryStage = seniorityConfig.allowedStages[Math.floor(seniorityConfig.allowedStages.length / 2)];
            fitLevel = (candidateStage === primaryStage) ? 'perfect' : 'reach';
        } else {
            // Check if it's a stretch (one level off) or complete mismatch
            const stageIndex = ['student', 'fresher', 'junior', 'mid-level', 'senior'].indexOf(candidateStage);
            const allowedIndices = seniorityConfig.allowedStages.map(s =>
                ['student', 'fresher', 'junior', 'mid-level', 'senior'].indexOf(s)
            );
            const minAllowed = Math.min(...allowedIndices);
            const maxAllowed = Math.max(...allowedIndices);

            const isStretch = (stageIndex === minAllowed - 1) || (stageIndex === maxAllowed + 1);
            fitLevel = isStretch ? 'stretch' : 'mismatch';
        }

        return {
            ...role,
            seniority,
            fitLevel,
            seniorityReason: reason,
        };
    });
}

/**
 * Get recommended roles for a career stage
 */
function getRecommendedSeniorities(stage: CareerStage): RoleSeniority[] {
    const recommendations: Record<CareerStage, RoleSeniority[]> = {
        student: ['intern', 'entry'],
        fresher: ['entry', 'junior'],
        junior: ['junior', 'mid'],
        'mid-level': ['mid', 'senior'],
        senior: ['senior', 'lead', 'staff', 'principal'],
    };

    return recommendations[stage];
}

/**
 * Calculate role fit score
 */
function calculateRoleFit(
    role: { title: string; requiredSkills?: string[] },
    candidate: {
        stage: CareerStage;
        skills: string[];
        experienceYears: number | null;
    }
): {
    overall: number; // 0-100
    breakdown: {
        seniorityFit: number;
        skillFit: number;
        experienceFit: number;
    };
} {
    const roleSeniority = detectRoleSeniority(role.title);
    const seniorityConfig = ROLE_SENIORITY_MAP[roleSeniority];

    // Seniority fit (0-100)
    const seniorityFit = seniorityConfig.allowedStages.includes(candidate.stage) ? 100 : 0;

    // Skill fit (0-100)
    const requiredSkills = role.requiredSkills || [];
    const matchedSkills = requiredSkills.filter(required =>
        candidate.skills.some(candidateSkill =>
            candidateSkill.toLowerCase() === required.toLowerCase()
        )
    );
    const skillFit = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 50;

    // Experience fit (0-100)
    let experienceFit = 50; // Default if experience unknown
    if (candidate.experienceYears !== null) {
        if (candidate.experienceYears >= seniorityConfig.minYears) {
            if (seniorityConfig.maxYears === null || candidate.experienceYears <= seniorityConfig.maxYears) {
                experienceFit = 100; // Perfect fit
            } else {
                // Over-qualified
                experienceFit = Math.max(0, 100 - ((candidate.experienceYears - seniorityConfig.maxYears!) * 10));
            }
        } else {
            // Under-qualified
            experienceFit = Math.max(0, (candidate.experienceYears / seniorityConfig.minYears) * 70);
        }
    }

    // Weighted overall (seniority is most important)
    const overall = Math.round(
        seniorityFit * 0.4 +
        skillFit * 0.35 +
        experienceFit * 0.25
    );

    return {
        overall,
        breakdown: {
            seniorityFit,
            skillFit,
            experienceFit,
        },
    };
}
