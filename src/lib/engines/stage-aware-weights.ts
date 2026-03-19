/**
 * Stage-Aware ATS Weight Configuration
 * Different scoring priorities based on career stage
 * Prevents unfair penalization (e.g., students lacking senior signals)
 */

import type { CareerStage } from '@/types/career-stage';

export interface StageWeightConfig {
    keywordMatch: number;
    skillRelevance: number;
    sectionCompleteness: number;
    actionVerbs: number;
    quantification: number;
    projectQuality: number; // Student/Fresher
    experienceDepth: number; // Mid/Senior
    leadership: number; // Senior
}

/**
 * Weight configurations per career stage
 * All weights must sum to 100
 */
export const STAGE_WEIGHT_CONFIGS: Record<CareerStage, StageWeightConfig> = {
    student: {
        skillRelevance: 30, // Skills matter most for students
        projectQuality: 25, // Projects replace work experience
        keywordMatch: 15,
        sectionCompleteness: 15, // Some sections OK to be missing
        actionVerbs: 10,
        quantification: 5, // Students may not have quantified metrics
        experienceDepth: 0,
        leadership: 0,
    },
    fresher: {
        skillRelevance: 25,
        projectQuality: 20, // Projects still important
        experienceDepth: 15, // Some work experience expected
        keywordMatch: 15,
        sectionCompleteness: 10,
        actionVerbs: 10,
        quantification: 5,
        leadership: 0,
    },
    junior: {
        experienceDepth: 25, // Experience becoming more important
        skillRelevance: 25,
        keywordMatch: 15,
        actionVerbs: 13,
        projectQuality: 10, // Projects less critical
        quantification: 7,
        sectionCompleteness: 5,
        leadership: 0,
    },
    'mid-level': {
        experienceDepth: 30, // Primary factor
        skillRelevance: 20,
        quantification: 15, // Impact metrics expected
        keywordMatch: 15,
        actionVerbs: 10,
        leadership: 5, // Some leadership emerging
        sectionCompleteness: 5,
        projectQuality: 0, // Projects not main focus
    },
    senior: {
        experienceDepth: 30,
        quantification: 20, // Metrics critical
        leadership: 15, // Leadership required
        skillRelevance: 15,
        keywordMatch: 10,
        actionVerbs: 5,
        sectionCompleteness: 5,
        projectQuality: 0,
    },
};

/**
 * Get weight configuration for a career stage
 */
function getStageWeights(stage: CareerStage): StageWeightConfig {
    return STAGE_WEIGHT_CONFIGS[stage];
}

/**
 * Get human-readable explanation of stage-specific weights
 */
function getWeightRationale(stage: CareerStage): string {
    const rationales: Record<CareerStage, string> = {
        student:
            'Students are evaluated primarily on skills (30%) and project quality (25%). Quantified metrics and leadership are not expected.',
        fresher:
            'Freshers are evaluated on skills (25%), projects (20%), and emerging work experience (15%). Limited quantification expected.',
        junior:
            'Junior professionals are evaluated equally on experience depth (25%) and skills (25%). Projects carry less weight.',
        'mid-level':
            'Mid-level professionals are evaluated on experience depth (30%), skills (20%), and quantified impact (15%). Leadership signals begin to matter.',
        senior:
            'Senior professionals are evaluated on experience depth (30%), quantified metrics (20%), and leadership (15%). Skills remain important but not primary.',
    };
    return rationales[stage];
}

/**
 * Get stage-appropriate section requirements
 * Different stages expect different sections
 */
export function getRequiredSections(stage: CareerStage): string[] {
    const baseRequired = ['Skills', 'Education'];

    const stageSpecific: Record<CareerStage, string[]> = {
        student: [...baseRequired, 'Projects'], // Projects replace work experience
        fresher: [...baseRequired, 'Projects', 'Experience'], // Both projects and experience
        junior: [...baseRequired, 'Experience', 'Professional Summary'],
        'mid-level': [...baseRequired, 'Experience', 'Professional Summary', 'Achievements'],
        senior: [...baseRequired, 'Experience', 'Professional Summary', 'Achievements', 'Leadership'],
    };

    return stageSpecific[stage];
}

/**
 * Check if a section is stage-appropriate
 */
function isSectionCriticalForStage(
    sectionName: string,
    stage: CareerStage
): boolean {
    const required = getRequiredSections(stage);
    return required.includes(sectionName);
}

/**
 * Get stage-specific recommendations for missing sections
 */
function getSectionRecommendation(
    missingSectionName: string,
    stage: CareerStage
): string | null {
    const recommendations: Record<CareerStage, Record<string, string>> = {
        student: {
            Projects: 'Add 2-3 academic or personal projects showcasing your skills. Include GitHub links.',
            Experience: 'Add internships if available. Not critical for students.',
            'Professional Summary': 'Optional for students. Consider adding a brief summary of your skills and goals.',
        },
        fresher: {
            Experience: 'Add any internships, co-op positions, or part-time work. Even 3-6 months of experience matters.',
            Projects: 'Showcase 2-3 strong projects to compensate for limited work experience.',
            'Professional Summary': 'Add a 2-3 sentence summary highlighting your skills and career goals.',
        },
        junior: {
            'Professional Summary': 'Add a 3-4 sentence summary highlighting 1-3 years of experience and key skills.',
            Achievements: 'Extract measurable achievements from your work experience.',
            Projects: 'Optional. Include if they demonstrate significant technical depth.',
        },
        'mid-level': {
            Achievements: 'Critical. Quantify your impact: efficiency gains, cost savings, user growth.',
            'Professional Summary': 'Summarize 3-7 years of experience and your specialization.',
            Leadership: 'If you\'ve mentored, led projects, or managed juniors, create a dedicated section.',
        },
        senior: {
            Leadership: 'Essential. Detail team size, scope of influence, and organizational impact.',
            Achievements: 'Quantify at scale: revenue impact, system reliability, team productivity.',
            'Professional Summary': 'Highlight strategic contributions and architectural leadership.',
        },
    };

    return recommendations[stage]?.[missingSectionName] || null;
}
