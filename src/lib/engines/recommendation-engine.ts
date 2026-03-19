/**
 * Causal Recommendation Engine
 * 
 * Generates recommendations that are directly mapped to detected deficiencies,
 * with full traceability to data sources, skill gaps, and role requirements.
 */

import { computeSpecificityReport } from './specificity-scorer';

export interface CausalRecommendation {
    id: string;
    category: "resume" | "skills" | "portfolio" | "certifications";
    title: string;
    description: string;
    priorityLevel: "critical" | "high" | "medium" | "low";
    estimatedEffort: string;
    estimatedImpact: number; // 1-10, hiring impact

    /** Full causal context */
    causalContext: string;

    /** Projected score impact simulation (Phase 8) — populated by attachImpactSimulations */
    projectedImpact?: {
        atsGain: number;         // Estimated JD alignment score gain
        roleMatchGain: number;   // Estimated role match % gain
        description: string;     // e.g. "Add 2 deployed projects → JD Alignment +6 | Role Match +8%"
    };
}

export interface AnalysisDeficiency {
    type: "keyword-gap" | "ats-score" | "skill-gap" | "portfolio-weakness" | "section-incomplete";
    severity: number; // 0-100
    details: Record<string, unknown>;
    targetRole?: string;
}

/**
 * Generate actionable recommendation from a detected deficiency
 */
export function generateRecommendation(
    deficiency: AnalysisDeficiency,
    index: number
): CausalRecommendation | null {
    

    const id = `rec-${deficiency.type}-${index}`;

    switch (deficiency.type) {
        case "keyword-gap":
            return {
                id,
                category: "resume",
                title: `Add missing keyword: ${String(deficiency.details.keyword ?? 'Unknown')}`,
                description: `Incorporate "${String(deficiency.details.keyword ?? 'Unknown')}" into your ${String(deficiency.details.suggestedSection ?? 'resume')}`,
                priorityLevel: deficiency.details.importance === "high" ? "critical" : "medium",
                estimatedEffort: "15-30 minutes",
                estimatedImpact: deficiency.details.importance === "high" ? 9 : 6,
                causalContext: `Keyword "${String(deficiency.details.keyword ?? 'Unknown')}" appears ${String(deficiency.details.jdFrequency ?? 0)}× in JD but 0× in resume. Classified as ${String(deficiency.details.importance ?? 'medium')}-importance requirement.`,
            };

        case "ats-score":
            if (deficiency.details.factor === "keyword-match") {
                return {
                    id,
                    category: "resume",
                    title: "Improve keyword matching",
                    description: "Add job-specific keywords throughout your resume sections",
                    priorityLevel: "critical",
                    estimatedEffort: "1-2 hours",
                    estimatedImpact: 10,
                    causalContext: `Keyword match scored ${String(deficiency.details.score ?? 0)}% (below 70% threshold). Keyword matching is 30% of overall JD alignment score.`,
                };
            } else if (deficiency.details.factor === "quantification") {
                return {
                    id,
                    category: "resume",
                    title: "Add quantifiable metrics",
                    description: "Include numbers, percentages, and measurable achievements in bullet points",
                    priorityLevel: "high",
                    estimatedEffort: "1 hour",
                    estimatedImpact: 8,
                    causalContext: `Only ${String(deficiency.details.count ?? 0)} quantified metrics found (target: 10+). Quantification is 20% of overall JD alignment score.`,
                };
            }
            break;

        case "skill-gap": {
            const skillName = String(deficiency.details.skill ?? 'Unknown Skill');
            const lowerSkill = skillName.toLowerCase();
            const TOOLS_NOT_SKILLS = [
                'chatgpt', 'claude', 'gemini', 'copilot', 'midjourney', 'dalle', 'stable diffusion',
                'chatbot', 'openai', 'anthropic', 'gpt-4', 'gpt-3', 'llm', 'api'
            ];

            const isTool = TOOLS_NOT_SKILLS.some(tool => lowerSkill.includes(tool));

            const title = isTool ? `Add ${skillName} experience` : `Learn ${skillName}`;
            const description = isTool ? `Add demonstrated usage of ${skillName} to your resume` : `Acquire ${skillName} to match ${deficiency.targetRole || "target role"}`;

            return {
                id,
                category: "skills",
                title,
                description,
                priorityLevel: deficiency.details.skillType === "core" ? "critical" : "medium",
                estimatedEffort: (deficiency.details.estimatedLearningTime as string | undefined) || "2-4 weeks",
                estimatedImpact: deficiency.details.skillType === "core" ? 9 : 6,
                causalContext: `${skillName} is a ${String(deficiency.details.skillType ?? 'core')} skill (${String(deficiency.details.weight ?? 1)}× weight) for ${deficiency.targetRole ?? 'target role'}. Required with ${String(deficiency.details.weight ?? 1)}× importance weight.`,
            };
        }

        case "portfolio-weakness":
            if (deficiency.details.weakness === "no-live-demos") {
                return {
                    id,
                    category: "portfolio",
                    title: "Deploy projects to production",
                    description: "Host at least 3 projects on live platforms (Vercel, Netlify, AWS)",
                    priorityLevel: "high",
                    estimatedEffort: "1-2 weeks",
                    estimatedImpact: 7,
                    causalContext: `Only ${String(deficiency.details.liveCount ?? 0)} of ${String(deficiency.details.totalProjects ?? 0)} projects have live URLs. Live deployments demonstrate production-ready skills.`,
                };
            } else if (deficiency.details.weakness === "poor-documentation") {
                return {
                    id,
                    category: "portfolio",
                    title: "Improve project documentation",
                    description: "Add comprehensive README files with setup instructions, architecture, and screenshots",
                    priorityLevel: "medium",
                    estimatedEffort: "3-5 days",
                    estimatedImpact: 6,
                    causalContext: `Average README length: ${String(deficiency.details.avgLength ?? 0)} words (target: 300+). Documentation quality signals professionalism and communication skills.`,
                };
            }
            break;

        case "section-incomplete": {
            const rawName = deficiency.details.sectionName;
            const missingSections = deficiency.details.missingSections;

            if (Array.isArray(missingSections) && missingSections.length > 0) {
                const validSections = missingSections.filter(s =>
                    s &&
                    typeof s === 'string' &&
                    s.trim().length > 0 &&
                    s.toLowerCase() !== 'required section' &&
                    s.toLowerCase() !== 'required' &&
                    s !== 'undefined'
                );

                if (validSections.length === 0) return null;

                const sectionName = validSections[0];
                return {
                    id,
                    category: "resume" as const,
                    title: `Add missing section: ${sectionName}`,
                    description: `Include a ${sectionName} section with relevant content`,
                    priorityLevel: "high" as const,
                    estimatedEffort: "30-60 minutes",
                    estimatedImpact: 7,
                    causalContext: `${sectionName} section is missing. Standard section expected by recruiters.`,
                };
            }

            const sectionName = String(rawName ?? '').trim();

            if (
                !sectionName ||
                sectionName.toLowerCase() === 'required section' ||
                sectionName.toLowerCase() === 'required' ||
                sectionName === 'undefined' ||
                sectionName === 'null'
            ) {
                return null;
            }

            return {
                id,
                category: "resume" as const,
                title: `Add missing section: ${sectionName}`,
                description: `Include a ${sectionName} section with relevant content`,
                priorityLevel: "high" as const,
                estimatedEffort: "30-60 minutes",
                estimatedImpact: 7,
                causalContext: `${sectionName} section is missing. Standard section expected by recruiters.`,
            };
        }
    }

    // Fallback
    return {
        id,
        category: "resume",
        title: "General improvement needed",
        description: "Review and enhance based on analysis",
        priorityLevel: "medium",
        estimatedEffort: "1 hour",
        estimatedImpact: 5,
        causalContext: `Deficiency detected in ${deficiency.type}: ${JSON.stringify(deficiency.details)}`,
    };
}

/**
 * Generate prioritized list of recommendations from multiple deficiencies
 */
export function generateRecommendations(
    deficiencies: AnalysisDeficiency[]
): CausalRecommendation[] {
    const recommendations = deficiencies
        .map((def, idx) => generateRecommendation(def, idx))
        .filter((r): r is CausalRecommendation => r !== null);

    // Sort by priority and impact
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return recommendations.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel];
        if (priorityDiff !== 0) return priorityDiff;
        return b.estimatedImpact - a.estimatedImpact;
    });
}

/**
 * Simulate the score impact of a recommendation.
 * Estimates how much JD Alignment and Role Match scores would change
 * if the recommendation were implemented.
 */
export function simulateImpact(
    recommendation: CausalRecommendation,
    currentScores: { keywordCoverageScore: number; roleMatchScore: number }
): { atsGain: number; roleMatchGain: number; description: string } {
    // Impact coefficients by category and priority
    const impactMap: Record<string, Record<string, { ats: number; role: number }>> = {
        resume: {
            critical: { ats: 8, role: 4 },
            high: { ats: 5, role: 3 },
            medium: { ats: 3, role: 2 },
            low: { ats: 1, role: 1 },
        },
        skills: {
            critical: { ats: 5, role: 10 },
            high: { ats: 3, role: 7 },
            medium: { ats: 2, role: 4 },
            low: { ats: 1, role: 2 },
        },
        portfolio: {
            critical: { ats: 4, role: 6 },
            high: { ats: 3, role: 5 },
            medium: { ats: 2, role: 3 },
            low: { ats: 1, role: 2 },
        },
        certifications: {
            critical: { ats: 3, role: 5 },
            high: { ats: 2, role: 4 },
            medium: { ats: 1, role: 3 },
            low: { ats: 1, role: 1 },
        },
    };

    const coefficients = impactMap[recommendation.category]?.[recommendation.priorityLevel]
        || { ats: 2, role: 3 };

    // Scale gains by how much room for improvement exists
    const atsHeadroom = Math.max(0, 100 - currentScores.keywordCoverageScore);
    const roleHeadroom = Math.max(0, 100 - currentScores.roleMatchScore);

    const atsGain = Math.round(Math.min(coefficients.ats, atsHeadroom * 0.15));
    const roleMatchGain = Math.round(Math.min(coefficients.role, roleHeadroom * 0.15));

    const description = `${recommendation.title} → JD Alignment +${atsGain} | Role Match +${roleMatchGain}%`;

    return { atsGain, roleMatchGain, description };
}

/**
 * Attach impact simulation to all recommendations in a batch
 */
export function attachImpactSimulations(
    recommendations: CausalRecommendation[],
    currentScores: { keywordCoverageScore: number; roleMatchScore: number }
): CausalRecommendation[] {
    return recommendations.map(rec => ({
        ...rec,
        projectedImpact: simulateImpact(rec, currentScores),
    }));
}

// ─────────────────────────────────────────────────────────────
// RESUME-INTRINSIC RECOMMENDATION ENGINE
// Generates CausalRecommendations from resume content alone, no JD required.
// ─────────────────────────────────────────────────────────────

export interface RecommendationInput {
    resumeText: string;
    quantifiedMetricsCount: number;
    actionVerbsCount: number;
    extractedSkills: string[];
    totalWords: number;
}

/**
 * Build CausalRecommendations from resume-intrinsic checks.
 * These fire regardless of whether a job description was provided.
 */
export function buildIntrinsicDeficiencies(input: RecommendationInput): CausalRecommendation[] {
    const results: CausalRecommendation[] = [];
    let idx = 0;

    // CHECK 1: Quantified Metrics
    if (input.quantifiedMetricsCount < 3) {
        results.push({
            id: `intrinsic-metrics-${idx++}`,
            category: 'resume',
            title: 'No Quantified Achievements',
            description: 'Your resume has fewer than 3 measurable results. Recruiters need numbers to evaluate impact.',
            priorityLevel: 'high',
            estimatedEffort: '1-2 hours',
            estimatedImpact: 9,
            causalContext: `Only ${input.quantifiedMetricsCount} quantified metric(s) detected (target: 3+). Add specific metrics: "Reduced processing time by 40%", "Managed 200+ prompts".`,
        });
    }

    // CHECK 2: Action Verb Count
    if (input.actionVerbsCount < 5) {
        results.push({
            id: `intrinsic-verbs-${idx++}`,
            category: 'resume',
            title: 'Weak or Missing Action Verbs',
            description: 'Strong resumes open bullet points with power verbs. Yours uses fewer than 5.',
            priorityLevel: 'high',
            estimatedEffort: '30-60 minutes',
            estimatedImpact: 8,
            causalContext: `${input.actionVerbsCount} action verb(s) detected (target: 5+). Start bullets with: Developed, Engineered, Designed, Led, Optimized, Delivered, Architected, Launched, Reduced, Built.`,
        });
    }

    const summaryPatterns = [
        // Match content between PROFESSIONAL SUMMARY and next 
        // all-caps section header (3+ caps on its own line)
        /(?:professional\s+summary|summary)\s*[\n:]([\s\S]+?)(?=\n[A-Z][A-Z\s]{2,}\n|\n(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|EMPLOYMENT|WORK)\b)/i,
        // Fallback: first paragraph after summary heading
        /(?:professional\s+summary|summary)\s*[\n:]\s*(.+(?:\n.+){0,5})/i,
    ];

    let summaryText = '';
    for (const pattern of summaryPatterns) {
        const match = input.resumeText.match(pattern);
        if (match && match[1]) {
            summaryText = match[1].trim();
            break;
        }
    }

    const summaryWordCount = summaryText
        .split(/\s+/)
        .filter(w => w.length > 0).length;

    if (summaryWordCount > 0 && summaryWordCount < 50) {
        results.push({
            id: `intrinsic-summary-${idx++}`,
            category: 'resume',
            title: 'Professional Summary Needs Strengthening',
            description: 'Your summary section is very brief. It should immediately communicate your value proposition.',
            priorityLevel: 'medium',
            estimatedEffort: '30-45 minutes',
            estimatedImpact: 7,
            causalContext: `Summary area ~${summaryWordCount} words (target: 50+). Write 3-4 sentences: your specialization, top 2-3 skills, and one concrete proof point.`,
        });
    }

    // CHECK 4: Skills Section Density
    if (input.extractedSkills.length < 8) {
        results.push({
            id: `intrinsic-skills-${idx++}`,
            category: 'skills',
            title: 'Skills Section Too Sparse',
            description: 'Only a small number of skills were detected. ATS systems rely heavily on skill density.',
            priorityLevel: 'medium',
            estimatedEffort: '30 minutes',
            estimatedImpact: 7,
            causalContext: `${input.extractedSkills.length} skill(s) detected (target: 8+). List specific tools: "Vertex AI", "AWS Bedrock", "LangChain".`,
        });
    }

    // CHECK 5: LinkedIn Presence
    if (!/linkedin\.com/i.test(input.resumeText)) {
        results.push({
            id: `intrinsic-linkedin-${idx++}`,
            category: 'resume',
            title: 'LinkedIn URL Not Detected',
            description: 'LinkedIn profile URL was not found in your resume.',
            priorityLevel: 'low',
            estimatedEffort: '5 minutes',
            estimatedImpact: 5,
            causalContext: 'No linkedin.com URL found. Add it to your header. Recruiters verify candidates before interviews.',
        });
    }

    // CHECK 6: Certifications
    if (!/certif(ication|ied)/i.test(input.resumeText)) {
        results.push({
            id: `intrinsic-certs-${idx++}`,
            category: 'certifications',
            title: 'Certifications Not Prominently Listed',
            description: 'No certification section detected. For AI and cloud roles, certs are strong hiring signals.',
            priorityLevel: 'low',
            estimatedEffort: 'Ongoing',
            estimatedImpact: 6,
            causalContext: 'No "certification" or "certified" keyword found. Add a Certifications section with issuing org and year.',
        });
    }

    // CHECK 7: Word Count
    if (input.totalWords < 150) {
        results.push({
            id: `intrinsic-wordcount-${idx++}`,
            category: 'resume',
            title: 'Resume Content Too Thin',
            description: 'Your resume contains fewer than 150 words.',
            priorityLevel: 'high',
            estimatedEffort: '2-3 hours',
            estimatedImpact: 10,
            causalContext: `${input.totalWords} words detected (target: 150+). Aim for 400-600 words total.`,
        });
    }

    // CHECK 8: Bullet Specificity
    const specificityCheck = computeSpecificityReport(input.resumeText || '');
    if (specificityCheck.averageScore < 3 && specificityCheck.bullets.length > 0) {
        const weakCount = specificityCheck.weakBullets.length;
        const examples = specificityCheck.weakBullets
            .slice(0, 2)
            .map(b => `"${b.text.slice(0, 60)}..."`);
        results.push({
            id: 'intrinsic-specificity',
            category: 'resume',
            title: 'Bullet Points Lack Specificity',
            description: `${weakCount} of your bullet points score 1-2/5 on specificity. ` +
                `Recruiters and interviewers will push back on vague claims.`,
            priorityLevel: specificityCheck.averageScore < 2 ? 'high' : 'medium',
            estimatedEffort: '2-3 hours',
            estimatedImpact: 8,
            causalContext: `Average specificity score: ${specificityCheck.averageScore}/5. distribution: ${Object.entries(specificityCheck.distribution).map(([k, v]) => `${k}★:${v}`).join(', ')}`,
        });
    }

    return results;
}

