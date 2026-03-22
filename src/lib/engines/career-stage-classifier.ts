/**
 * Career Stage Classifier — Confidence Engine
 * Classifies candidates into Student/Fresher/Junior/Mid-Level/Senior based on resume signals
 * PRIMARY DIRECTIVE: Accuracy over impressiveness. No guessing.
 * 
 * UPGRADE: Now outputs confidence_drivers[], runs secondary heuristic when
 * confidence < threshold, and prevents advanced student misclassification.
 */

import type {
    CareerStage,
    CareerStageSignals,
    CareerStageClassification,
    ConfidenceDriver,
} from '@/types/career-stage';
import {
    extractExperiences,
    calculateTotalExperience,
    extractGraduationYear,
} from './experience-extractor';

/** Confidence threshold below which secondary heuristic runs */
const CONFIDENCE_THRESHOLD = 60;

/**
 * Detect if candidate is currently a student
 */
function detectStudentStatus(resumeText: string): boolean {
    const studentKeywords = [
        /\bcurrently\s+pursuing\b/i,
        /\bexpected\s+graduation\b/i,
        /\banticipated\s+graduation\b/i,
        /\bstudent\s+at\b/i,
        /\bundergraduate\b/i,
        /\bgrad\s+student\b/i,
    ];

    return studentKeywords.some(pattern => pattern.test(resumeText));
}

/**
 * Extract seniority keywords from resume
 */
function extractSeniorityKeywords(resumeText: string): string[] {
    const keywords: string[] = [];
    const patterns = [
        /\bsenior\s+\w+\s+engineer\b/gi,
        /\blead\s+\w+\b/gi,
        /\bprincipal\s+\w+\b/gi,
        /\bstaff\s+engineer\b/gi,
        /\barchitect\b/gi,
        /\bdirector\b/gi,
        /\bvp\b/gi,
        /\bchief\b/gi,
    ];

    patterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) {
            keywords.push(...matches.map(m => m.trim()));
        }
    });

    return [...new Set(keywords)]; // Unique only
}

/**
 * Extract leadership indicators
 */
function extractLeadershipIndicators(resumeText: string): string[] {
    const indicators: string[] = [];
    const patterns = [
        /\b(?:managed|led)\s+(?:a\s+)?team\s+of\s+\d+/gi,
        /\bmentored\s+\d+\s+\w+/gi,
        /\bmanaged\s+\d+\s+\w+/gi,
        /\bteam\s+lead\b/gi,
        /\btechnical\s+lead\b/gi,
    ];

    patterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) {
            indicators.push(...matches.map(m => m.trim()));
        }
    });

    return [...new Set(indicators)];
}

/**
 * Count sections (rough proxy for content type)
 */
function countContentSections(resumeText: string): {
    projectCount: number;
    certificationCount: number;
} {
    // Count "Project" sections or bullet-pointed projects
    const projectMatches = resumeText.match(/\bproject\b/gi) || [];
    const projectTitleMatches = resumeText.match(/(?:^|\n)[A-Z][^\n]{10,60}(?:Project|System|App|Tool|Platform|Engine|Interface|Bot|Assistant)\b/gm) || [];
    const builtMatches = resumeText.match(/(?:built|developed|created|designed|implemented)\s+(?:a|an)\s+/gi) || [];
    const projectCount = Math.min(
        Math.max(projectMatches.length, projectTitleMatches.length, builtMatches.length),
        10
    );


    // Count explicit cert keywords
    const certKeywordMatches = resumeText.match(
        /\b(certified|certification|certificate|certifications)\b/gi
    ) || [];

    // Count lines that look like certification entries:
    // Lines with known cert providers or credential IDs
    const certLineMatches = resumeText.match(
        /\b(AWS|Amazon|Google|Microsoft|IBM|Coursera|Udemy|Forage|HackerRank|Credly|CompTIA|Cisco|Oracle|PMI|Scrum|credential\s*id)\b/gi
    ) || [];

    // Count "Job Simulation" entries (Forage certs)
    const simulationMatches = resumeText.match(
        /job\s+simulation/gi
    ) || [];

    // Deduplicate: use the higher of keyword count
    // or line-based count, capped at 10
    const certificationCount = Math.min(
        10,
        Math.max(
            certKeywordMatches.length,
            Math.round(certLineMatches.length / 2),
            simulationMatches.length
        )
    );

    return { projectCount, certificationCount };
}

/**
 * Compute project density — projects per 500 words of resume
 */
function computeProjectDensity(projectCount: number, wordCount: number): number {
    if (wordCount === 0) return 0;
    return Math.round((projectCount / wordCount) * 500 * 100) / 100;
}

/**
 * Compute certification clustering score (0-100)
 * High score = many certs clustered in resume, signals cert-heavy profile
 */
function computeCertClusterScore(resumeText: string, certCount: number): number {
    if (certCount === 0) return 0;
    // Check for certification section density
    const certSectionMatch = resumeText.match(/certification[s]?\s*[\n\r:]/gi);
    const hasDedicatedSection = certSectionMatch !== null;
    const certKeywords = (resumeText.match(/\b(AWS\s+Certified|Google\s+Cloud|Azure\s+Certified|PMP|Scrum\s+Master|CompTIA|CISSP|CKA|CKAD)\b/gi) || []).length;

    let score = Math.min(certCount * 15, 60);
    if (hasDedicatedSection) score += 20;
    score += Math.min(certKeywords * 10, 20);
    return Math.min(score, 100);
}

/**
 * Compute tool diversity score (0-100)
 * High = many different tools across categories; Low = deep in few tools
 */
function computeToolDiversity(resumeText: string): { score: number; uniqueCount: number } {
    const toolCategories = {
        languages: /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala|r)\b/gi,
        frameworks: /\b(react|angular|vue|next\.?js|express|django|flask|spring|laravel|rails)\b/gi,
        databases: /\b(mysql|postgresql|mongodb|redis|elasticsearch|sqlite|dynamodb|cassandra|firebase)\b/gi,
        cloud: /\b(aws|azure|gcp|heroku|vercel|netlify|cloudflare)\b/gi,
        devops: /\b(docker|kubernetes|jenkins|terraform|ansible|circleci|github\s+actions)\b/gi,
        aiml: /\b(tensorflow|pytorch|scikit-learn|keras|pandas|numpy|jupyter|hugging\s*face)\b/gi,
    };

    const uniqueTools = new Set<string>();
    let categoriesHit = 0;

    for (const [, pattern] of Object.entries(toolCategories)) {
        const matches = resumeText.match(pattern) || [];
        if (matches.length > 0) categoriesHit++;
        matches.forEach(m => uniqueTools.add(m.toLowerCase()));
    }

    // Diversity = category spread × tool count, normalized
    const categorySpread = (categoriesHit / Object.keys(toolCategories).length) * 50;
    const toolBreadth = Math.min(uniqueTools.size * 5, 50);
    const score = Math.min(Math.round(categorySpread + toolBreadth), 100);

    return { score, uniqueCount: uniqueTools.size };
}

/**
 * Detect advanced student pattern: high projects, diverse tools, no employment
 * These should NOT be classified as juniors
 */
function isAdvancedStudent(signals: CareerStageSignals): boolean {
    return (
        signals.employmentCount === 0 &&
        signals.projectCount >= 5 &&
        signals.uniqueToolCount >= 6 &&
        signals.toolDiversityScore >= 40 &&
        (signals.totalExperienceYears === null || signals.totalExperienceYears < 1) &&
        (signals.isCurrentStudent || signals.certificationHeavy || signals.projectDensity > 1.5)
    );
}

/**
 * Extract all career stage signals from resume (extended with calibration signals)
 */
export function extractCareerStageSignals(resumeText: string): CareerStageSignals {
    const experiences = extractExperiences(resumeText);
    const totalExperienceYears = calculateTotalExperience(experiences);

    const employmentCount = experiences.filter(e => e.type === 'employment').length;
    const internshipCount = experiences.filter(e => e.type === 'internship').length;

    const isCurrentStudent = detectStudentStatus(resumeText);
    const graduationYear = extractGraduationYear(resumeText);

    const currentYear = new Date().getFullYear();
    const timeSinceGraduation = graduationYear ? currentYear - graduationYear : null;

    const { projectCount, certificationCount } = countContentSections(resumeText);
    const projectToEmploymentRatio = employmentCount > 0
        ? projectCount / employmentCount
        : projectCount; // If no employment, ratio is just project count

    const seniorityKeywords = extractSeniorityKeywords(resumeText);
    const leadershipIndicators = extractLeadershipIndicators(resumeText);

    const certificationHeavy = certificationCount > 3 && (totalExperienceYears || 0) < 2;

    // Extended signals (Phase 1 Calibration)
    const resumeWordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
    const projectDensity = computeProjectDensity(projectCount, resumeWordCount);
    const certClusterScore = computeCertClusterScore(resumeText, certificationCount);
    const { score: toolDiversityScore, uniqueCount: uniqueToolCount } = computeToolDiversity(resumeText);

    return {
        totalExperienceYears,
        employmentCount,
        internshipCount,
        isCurrentStudent,
        graduationYear,
        timeSinceGraduation,
        projectCount,
        projectToEmploymentRatio,
        seniorityKeywords,
        leadershipIndicators,
        certificationCount,
        certificationHeavy,
        // Extended
        resumeWordCount,
        projectDensity,
        certClusterScore,
        toolDiversityScore,
        uniqueToolCount,
    };
}

/**
 * Build confidence drivers from signals and classification decision
 */
function buildConfidenceDrivers(signals: CareerStageSignals, stage: CareerStage): ConfidenceDriver[] {
    const drivers: ConfidenceDriver[] = [];

    // Resume length signal
    if (signals.resumeWordCount < 150) {
        drivers.push({
            signal: 'Resume Length',
            contribution: -15,
            direction: 'conflicting',
            detail: `Very short resume (${signals.resumeWordCount} words). Insufficient data for confident classification.`,
        });
    } else if (signals.resumeWordCount > 600) {
        drivers.push({
            signal: 'Resume Length',
            contribution: 5,
            direction: 'supporting',
            detail: `Substantial resume (${signals.resumeWordCount} words). More data available for classification.`,
        });
    }

    // Project density signal
    if (signals.projectDensity > 2.0 && (stage === 'student' || stage === 'fresher')) {
        drivers.push({
            signal: 'Project Density',
            contribution: 10,
            direction: 'supporting',
            detail: `High project density (${signals.projectDensity.toFixed(1)} per 500 words) supports early-career classification.`,
        });
    } else if (signals.projectDensity > 2.0 && (stage === 'mid-level' || stage === 'senior')) {
        drivers.push({
            signal: 'Project Density',
            contribution: -10,
            direction: 'conflicting',
            detail: `High project density unusual for ${stage} professionals. May indicate portfolio-focused resume.`,
        });
    }

    // Certification clustering
    if (signals.certClusterScore > 60) {
        if (stage === 'student' || stage === 'fresher') {
            drivers.push({
                signal: 'Certification Clustering',
                contribution: 8,
                direction: 'supporting',
                detail: `Heavy certification profile (score: ${signals.certClusterScore}) is common for early-career candidates.`,
            });
        } else {
            drivers.push({
                signal: 'Certification Clustering',
                contribution: -5,
                direction: 'conflicting',
                detail: `Heavy certification clustering unusual for ${stage}. May compensate for experience gaps.`,
            });
        }
    }

    // Tool diversity vs depth
    if (signals.toolDiversityScore >= 60 && signals.uniqueToolCount >= 8) {
        if (stage === 'student') {
            drivers.push({
                signal: 'Tool Diversity',
                contribution: 10,
                direction: 'supporting',
                detail: `High tool diversity (${signals.uniqueToolCount} tools, score: ${signals.toolDiversityScore}) — breadth-oriented learning typical of students.`,
            });
        } else if (stage === 'senior') {
            drivers.push({
                signal: 'Tool Breadth',
                contribution: 5,
                direction: 'supporting',
                detail: `Wide tool exposure (${signals.uniqueToolCount} tools) supports experienced classification.`,
            });
        }
    } else if (signals.toolDiversityScore < 20) {
        drivers.push({
            signal: 'Tool Diversity',
            contribution: -5,
            direction: 'conflicting',
            detail: `Low tool diversity (score: ${signals.toolDiversityScore}). Limited data for skill-based stage inference.`,
        });
    }

    // Experience data quality
    if (signals.totalExperienceYears !== null) {
        drivers.push({
            signal: 'Experience Duration',
            contribution: 15,
            direction: 'supporting',
            detail: `Verifiable experience detected: ${signals.totalExperienceYears.toFixed(1)} years. Strong classification signal.`,
        });
    } else {
        drivers.push({
            signal: 'Experience Duration',
            contribution: -15,
            direction: 'conflicting',
            detail: 'No parseable employment dates found. Classification relies on indirect signals.',
        });
    }

    // Seniority keywords
    if (signals.seniorityKeywords.length > 0 && (stage === 'senior' || stage === 'mid-level')) {
        drivers.push({
            signal: 'Seniority Keywords',
            contribution: 12,
            direction: 'supporting',
            detail: `Title keywords detected: "${signals.seniorityKeywords.slice(0, 3).join(', ')}".`,
        });
    }

    // Leadership indicators
    if (signals.leadershipIndicators.length > 0 && stage === 'senior') {
        drivers.push({
            signal: 'Leadership Evidence',
            contribution: 10,
            direction: 'supporting',
            detail: `Leadership signals: "${signals.leadershipIndicators.slice(0, 2).join(', ')}".`,
        });
    }

    return drivers;
}

/**
 * Secondary heuristic classifier — runs when primary confidence < threshold
 * Uses conservative assignment logic
 */
function runSecondaryHeuristic(signals: CareerStageSignals): {
    stage: CareerStage;
    reasoning: string;
} {
    // Conservative rules for low-confidence scenarios
    // Priority: use the most concrete evidence available

    // If we have employment count, use it
    if (signals.employmentCount >= 3) {
        return {
            stage: 'mid-level',
            reasoning: 'Secondary heuristic: 3+ employers detected. Conservative mid-level assignment.',
        };
    }

    // If mostly projects, no employment → student
    if (signals.employmentCount === 0 && signals.projectCount >= 3) {
        return {
            stage: 'student',
            reasoning: 'Secondary heuristic: No employment, project-heavy resume. Conservative student assignment.',
        };
    }

    // If 1-2 employers, internships → fresher
    if (signals.employmentCount <= 2 && signals.internshipCount > 0) {
        return {
            stage: 'fresher',
            reasoning: 'Secondary heuristic: Limited employment with internships. Conservative fresher assignment.',
        };
    }

    // Absolute fallback: fresher (most conservative)
    return {
        stage: 'fresher',
        reasoning: 'Secondary heuristic: Insufficient data for confident classification. Conservative fresher default.',
    };
}

/**
 * Classify career stage based on signals
 * Uses rule-based logic with confidence scoring + confidence engine
 */
export function classifyCareerStage(resumeText: string): CareerStageClassification {
    const signals = extractCareerStageSignals(resumeText);

    let stage: CareerStage;
    let confidence: number;
    let reasoning: string;
    let alternativeStages: Array<{ stage: CareerStage; probability: number }> = [];

    // ADVANCED STUDENT DETECTION (prevents misclassification as junior)
    if (isAdvancedStudent(signals)) {
        stage = 'student';
        confidence = 85;
        reasoning = `Advanced student detected: ${signals.projectCount} projects, ${signals.uniqueToolCount} tools, no employment. Strong portfolio but no professional experience.`;
        alternativeStages = [{ stage: 'fresher', probability: 15 }];
    }
    // RULE 1: Current student
    else if (signals.isCurrentStudent) {
        stage = 'student';
        confidence = 95;
        reasoning = "Detected 'currently pursuing' or similar student status keywords.";
        alternativeStages = [{ stage: 'fresher', probability: 5 }];
    }
    // RULE 2: Recent graduate (within 2 years, no experience)
    else if (
        signals.timeSinceGraduation !== null &&
        signals.timeSinceGraduation <= 2 &&
        signals.totalExperienceYears === null
    ) {
        stage = 'student';
        confidence = 85;
        reasoning = `Graduated in ${signals.graduationYear}, no work experience detected. Likely student or fresh graduate.`;
        alternativeStages = [{ stage: 'fresher', probability: 15 }];
    }
    // RULE 3: High project-to-employment ratio (student projects)
    else if (
        signals.projectToEmploymentRatio > 0.7 &&
        signals.employmentCount === 0 &&
        signals.totalExperienceYears === null
    ) {
        stage = 'student';
        confidence = 80;
        reasoning = `Resume contains mostly projects (${signals.projectCount}) with no employment history. Likely student portfolio.`;
        alternativeStages = [{ stage: 'fresher', probability: 20 }];
    }
    // RULE 4: 0-1 year experience
    else if (
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears >= 0 &&
        signals.totalExperienceYears <= 1.5
    ) {
        stage = 'fresher';
        confidence = 90;
        reasoning = `Detected ${signals.totalExperienceYears.toFixed(1)} years of experience. Entry-level professional.`;
        alternativeStages = [
            { stage: 'student', probability: 5 },
            { stage: 'junior', probability: 5 },
        ];
    }
    // RULE 5: Internships only
    else if (
        signals.internshipCount > 0 &&
        signals.employmentCount === 0 &&
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears < 1
    ) {
        stage = 'fresher';
        confidence = 85;
        reasoning = `Has ${signals.internshipCount} internship(s) but no full-time employment. Early career stage.`;
        alternativeStages = [{ stage: 'student', probability: 15 }];
    }
    // RULE 6: 1-3 years experience
    else if (
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears > 1.5 &&
        signals.totalExperienceYears <= 3.5
    ) {
        stage = 'junior';
        confidence = 90;
        reasoning = `${signals.totalExperienceYears.toFixed(1)} years of experience. Junior professional.`;
        alternativeStages = [
            { stage: 'fresher', probability: 5 },
            { stage: 'mid-level', probability: 5 },
        ];
    }
    // RULE 7: Senior keywords present with experience
    else if (
        signals.seniorityKeywords.length > 0 &&
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears >= 5
    ) {
        stage = 'senior';
        confidence = 95;
        reasoning = `Senior-level keywords detected: "${signals.seniorityKeywords.join(', ')}". ${signals.totalExperienceYears.toFixed(1)} years of experience.`;
        alternativeStages = [{ stage: 'mid-level', probability: 5 }];
    }
    // RULE 8: Leadership indicators with 5+ years
    else if (
        signals.leadershipIndicators.length > 0 &&
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears >= 5
    ) {
        stage = 'senior';
        confidence = 90;
        reasoning = `Leadership experience detected: "${signals.leadershipIndicators.join(', ')}". ${signals.totalExperienceYears.toFixed(1)} years of experience.`;
        alternativeStages = [{ stage: 'mid-level', probability: 10 }];
    }
    // RULE 9: 7+ years experience (automatically senior)
    else if (
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears >= 7
    ) {
        stage = 'senior';
        confidence = 95;
        reasoning = `${signals.totalExperienceYears.toFixed(1)} years of experience qualifies as senior level.`;
        alternativeStages = [];
    }
    // RULE 10: 3-7 years experience (mid-level)
    else if (
        signals.totalExperienceYears !== null &&
        signals.totalExperienceYears > 3.5 &&
        signals.totalExperienceYears < 7
    ) {
        stage = 'mid-level';
        confidence = 90;
        reasoning = `${signals.totalExperienceYears.toFixed(1)} years of experience. Mid-level professional.`;
        alternativeStages = [
            { stage: 'junior', probability: 5 },
            { stage: 'senior', probability: 5 },
        ];
    }
    // RULE 11: FALLBACK - Insufficient data (conservative default)
    else {
        stage = 'fresher';
        confidence = 40;
        reasoning = "Insufficient data to accurately determine career stage. Defaulting to 'fresher' (conservative estimate).";
        alternativeStages = [
            { stage: 'student', probability: 30 },
            { stage: 'junior', probability: 30 },
        ];
    }

    // Build confidence drivers
    const confidenceDrivers = buildConfidenceDrivers(signals, stage);

    // Apply confidence driver adjustments
    const totalDriverAdjustment = confidenceDrivers.reduce((sum, d) => sum + d.contribution, 0);
    confidence = Math.max(10, Math.min(100, confidence + Math.round(totalDriverAdjustment * 0.3)));

    // Secondary heuristic fallback
    let secondaryStage: CareerStage | undefined;
    const uncertaintyFlag = confidence < CONFIDENCE_THRESHOLD;

    if (uncertaintyFlag) {
        const secondary = runSecondaryHeuristic(signals);
        secondaryStage = secondary.stage;
        reasoning += ` | ${secondary.reasoning}`;

        // If secondary disagrees, use the more conservative stage
        if (secondaryStage !== stage) {
            const stageOrder: Record<CareerStage, number> = {
                student: 0, fresher: 1, junior: 2, 'mid-level': 3, senior: 4,
            };
            // Conservative = lower stage
            if (stageOrder[secondaryStage] < stageOrder[stage]) {
                stage = secondaryStage;
                reasoning += ` Downgraded to ${stage} (conservative assignment under uncertainty).`;
            }
        }
    }

    return {
        stage,
        confidence,
        signals,
        reasoning,
        alternativeStages,
        confidenceDrivers,
        secondaryStage,
        uncertaintyFlag,
    };
}

/**
 * Get human-readable stage label
 */
export function getStageLabel(stage: CareerStage): string {
    const labels: Record<CareerStage, string> = {
        student: 'Student',
        fresher: 'Fresher (0-1 years)',
        junior: 'Junior (1-3 years)',
        'mid-level': 'Mid-Level (3-7 years)',
        senior: 'Senior (7+ years)',
    };
    return labels[stage];
}

/**
 * Get stage description
 */
export function getStageDescription(stage: CareerStage): string {
    const descriptions: Record<CareerStage, string> = {
        student: 'Currently pursuing education with academic projects and limited professional experience.',
        fresher: 'Entry-level professional with 0-1 years of work experience, transitioning from academia to industry.',
        junior: 'Early-career professional with 1-3 years of hands-on experience building practical skills.',
        'mid-level': 'Experienced professional with 3-7 years, demonstrating technical depth and autonomy.',
        senior: 'Seasoned professional with 7+ years, showing leadership, strategic thinking, and deep expertise.',
    };
    return descriptions[stage];
}
