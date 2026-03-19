/**
 * Career Stage Type Definitions
 * Defines career progression tiers and classification signals
 */

export type CareerStage = 'student' | 'fresher' | 'junior' | 'mid-level' | 'senior';

/** Describes a single signal that contributed to classification confidence */
export interface ConfidenceDriver {
    signal: string;           // e.g. "Resume Length", "Project Density"
    contribution: number;     // How much this signal affected confidence (-20 to +20)
    direction: 'supporting' | 'conflicting' | 'neutral';
    detail: string;           // Human-readable explanation
}

export interface CareerStageSignals {
    // Employment metrics
    totalExperienceYears: number | null; // Null if not detected
    employmentCount: number;
    internshipCount: number;

    // Academic indicators
    isCurrentStudent: boolean;
    graduationYear: number | null;
    timeSinceGraduation: number | null; // Years

    // Content composition
    projectCount: number;
    projectToEmploymentRatio: number; // >0.7 suggests student

    // Seniority markers
    seniorityKeywords: string[]; // senior, lead, principal, staff, director
    leadershipIndicators: string[]; // managed, led team, mentored

    // Certification profile
    certificationCount: number;
    certificationHeavy: boolean; // >3 certs, low experience = fresher/student

    // Extended signals (Phase 1 Calibration)
    resumeWordCount: number;
    projectDensity: number;       // projects per 500 words of resume
    certClusterScore: number;     // 0-100 cert clustering intensity
    toolDiversityScore: number;   // 0-100 breadth vs depth of tools
    uniqueToolCount: number;
}

export interface CareerStageClassification {
    stage: CareerStage;
    confidence: number; // 0-100
    signals: CareerStageSignals;
    reasoning: string; // Human-readable explanation
    alternativeStages: Array<{
        stage: CareerStage;
        probability: number;
    }>;

    // Phase 1: Confidence Engine Extensions
    confidenceDrivers: ConfidenceDriver[];
    secondaryStage?: CareerStage;       // From secondary heuristic if confidence < threshold
    uncertaintyFlag: boolean;            // True if confidence < 60
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
    isCurrent: boolean;
    durationMonths: number | null;
    confidence: number; // How confident we are in this parsing
}

export interface ExperienceEntry {
    type: 'employment' | 'internship' | 'project' | 'education';
    title: string;
    organization: string | null;
    dateRange: DateRange;
    description: string;
    technologies: string[];
}
