/**
 * ANALYSIS ORCHESTRATOR — v3.0 Calibrated Intelligence
 * Central brain that coordinates all grounded intelligence engines.
 * Enforces strict data flow and evidence validation.
 * 
 * PIPELINE:
 * 1. Text Parsing
 * 2. Evidence Validation (Middleware)
 * 3. Career Stage Classification (+ Confidence Engine)
 * 4. Experience & Skill Extraction
 * 5. Stage-Gated JD Alignment Scoring
 * 6. Market Calibration (NEW)
 * 7. Project Complexity Analysis (NEW)
 * 8. Evidence Strength Index (NEW)
 * 9. Role Matching (Multi-Factor) & Seniority Filtering
 * 10. Keyword Gap Analysis
 * 11. Portfolio Context Analysis
 * 12. Evidence-Bound Rewrites (+ Semantic Guardrails)
 * 13. Recommendations (+ Impact Simulation)
 * 14. Pipeline Integrity Safeguards (NEW)
 */

import { type ParsedResume } from '@/lib/parsers/resumeParser';
import { detectResumeSections, type SectionDetectionResult } from '@/lib/analysis/sectionDetector';
import { extractAndNormalizeSkills, type NormalizedSkill } from './skill-normalizer';
import { cleanJobDescription } from './jd-parser';
import {
    classifyCareerStage,
} from './career-stage-classifier';
import type { CareerStageClassification } from '@/types/career-stage';
import {
    computeTransparentJDAlignmentScore,
    type TransparentJDAlignmentScore
} from './ats-scoring-engine';
import {
    matchToAllWeightedRoles,
    type RoleMatch,
    type MultiFactorContext,
} from './weighted-role-matcher';
import {
    filterRolesByStage,
} from './role-seniority-filter';
import {
    analyzeKeywordGaps,
    type GapAnalysisResult
} from './keyword-gap-analysis';
import {
    analyzeGitHubPortfolio,
    type PortfolioAnalysis
} from '@/lib/integrations/githubClient';
import {
    rewriteResumeBullets,
    type GroundedRewrite
} from './grounded-rewriter';
import {
    generateRecommendations,
    attachImpactSimulations,
    buildIntrinsicDeficiencies,
    type AnalysisDeficiency,
    type RecommendationInput,
    type CausalRecommendation
} from './recommendation-engine';
import { computeParsingReliability, type FormatRiskAssessment } from './format-risk-detector';

// Phase 1-10 New engine imports
import { calibrateJDAlignmentScore, type MarketCalibration } from './market-calibration';
import { analyzeProjectComplexity, type ProjectComplexityResult } from './project-complexity-analyzer';
import { computeEvidenceStrength, type EvidenceStrengthResult } from './evidence-strength-index';
import { validatePipelineIntegrity, type IntegrityReport } from './pipeline-integrity';
import { computeSpecificityReport, type SpecificityReport } from './specificity-scorer';
import { globalBenchmark } from '../verification/performance-benchmark';

// Engine Result Wrapper
export type EngineResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Combined Analysis Result (Extended for Calibration Upgrade)
export interface AnalysisResult {
    meta: {
        version: string;
        timestamp: string;
        evidenceVerified: boolean;
        pipelineErrors: string[];
    };
    parsedProfile: {
        rawText: string;
        sections: SectionDetectionResult;
        skills: { rawSkills: string[]; normalizedSkills: NormalizedSkill[]; unrecognizedTerms: string[] };
    };
    careerStage: CareerStageClassification;
    scores: {
        keywordCoverage: TransparentJDAlignmentScore | null;
        portfolio: PortfolioAnalysis | null;
        format: FormatRiskAssessment;
    };
    roles: {
        matches: RoleMatch[];
        stageFiltered: (RoleMatch & { fitLevel?: string; seniorityReason?: string })[];
        topRoles: RoleMatch[];
    };
    gaps: GapAnalysisResult | null;
    improvements: {
        rewrittenBullets: Array<GroundedRewrite & { index: number }>;
    };
    recommendations: CausalRecommendation[];

    // Phase 2: Market Calibration
    calibration: MarketCalibration | null;

    // Phase 3: Project Complexity
    projectComplexity: ProjectComplexityResult | null;

    // Phase 7: Evidence Strength
    evidenceStrength: EvidenceStrengthResult | null;

    // Phase 10: Pipeline Integrity
    pipelineIntegrity: IntegrityReport | null;

    // Layer 4: Bullet Point Specificity
    specificityReport: SpecificityReport | null;
}

/**
 * EVIDENCE VALIDATION MIDDLEWARE
 * Ensures input data is sufficient for analysis
 */
function validateEvidence(text: string): void {
    if (!text || text.trim().length < 50) {
        throw new Error("Insufficient evidence: Resume text is too short to analyze.");
    }

    // Check for gibberish or encoding errors (basic heuristic)
    const nonAlphanumericRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
    if (nonAlphanumericRatio > 0.4) {
        throw new Error("Parsing error: Text contains excessive non-alphanumeric characters. Please check file encoding.");
    }
}

/**
 * Apply conservative rounding — Output Realism Directive
 * Borderline scores floor down, partial evidence reduces confidence
 */
function applyRealismDirective(score: number, evidenceModifier: number): number {
    // Apply evidence strength modifier
    let adjusted = Math.round(score * evidenceModifier);

    // Conservative floor: scores within 3 points of tier boundaries get rounded down
    const tierBoundaries = [30, 50, 70, 85];
    for (const boundary of tierBoundaries) {
        if (adjusted >= boundary && adjusted <= boundary + 3) {
            adjusted = boundary - 1;
        }
    }

    return Math.max(0, Math.min(100, adjusted));
}

/**
 * MAIN ANALYSIS ORCHESTRATOR
 */
export async function analyzeResume(
    parsedResume: ParsedResume,
    jobDescription?: string,
    githubUsername?: string,
    manualExperienceYears?: number,
    manualTargetRole?: string
): Promise<AnalysisResult> {
    globalBenchmark.startMarker('total_pipeline');
    const pipelineErrors: string[] = [];

    // Helper to safely execute an engine and track time
    const safeExecute = async <T>(engineName: string, fn: () => T | Promise<T>, fallback: T): Promise<EngineResult<T>> => {
        globalBenchmark.startMarker(`engine_${engineName}`);
        try {
            const result = await fn();
            globalBenchmark.endMarker(`engine_${engineName}`);
            return { success: true, data: result };
        } catch (e: any) {
            pipelineErrors.push(`[${engineName}] Failed: ${e.message || 'Unknown error'}`);
            console.error(`Pipeline isolation caught error in ${engineName}:`, e);
            globalBenchmark.endMarker(`engine_${engineName}`);
            return { success: false, data: fallback, error: e.message };
        }
    };

    // 1. Evidence Validation (Crashing here is acceptable, stops pipeline on bad file)
    validateEvidence(parsedResume.rawText);

    // 2. Section Detection
    const sectionResult = await safeExecute('sectionDetection',
        () => detectResumeSections(parsedResume.rawText),
        { sections: {}, detectedSectionNames: [], completenessScore: 0, warnings: [] }
    );
    const sectionResults = sectionResult.data!;

    // 3. Skill Extraction
    const resumeSkillsResult = await safeExecute('skillNormalization',
        () => extractAndNormalizeSkills(parsedResume.rawText),
        { rawSkills: [], normalizedSkills: [], unrecognizedTerms: [] }
    );
    const resumeSkills = resumeSkillsResult.data!;

    // 4. Career Stage Classification (+ Confidence Engine)
    globalBenchmark.startMarker('careerStage');
    const stageClassification = classifyCareerStage(parsedResume.rawText);
    globalBenchmark.endMarker('careerStage');

    // 5. Evidence Strength Index (compute early — feeds into everything)
    const evidenceStrengthResult = await safeExecute('evidenceStrength',
        () => computeEvidenceStrength(parsedResume.rawText),
        null
    );
    const evidenceStrength = evidenceStrengthResult.data;

    // 6. Project Complexity Analysis
    const projectComplexityResult = await safeExecute('projectComplexity',
        () => analyzeProjectComplexity(parsedResume.rawText),
        null
    );
    const projectComplexity = projectComplexityResult.data;

    // 7. Cleanup Job Description (if provided)
    let jdSkills = { rawSkills: [] as string[], normalizedSkills: [] as NormalizedSkill[], unrecognizedTerms: [] as string[] };
    let cleanedJD = { cleanedText: '', noiseReduction: 0 };

    if (jobDescription && jobDescription.trim().length > 50) {
        cleanedJD = cleanJobDescription(jobDescription);
        jdSkills = extractAndNormalizeSkills(cleanedJD.cleanedText);
    } else {
        // If JD is invalid, treat as null
        jobDescription = undefined;
    }

    // 8. Stage-Gated JD Alignment Scoring (+ Realism Directive)
    const resumeLower = parsedResume.rawText.toLowerCase();
    const ACTION_VERB_LIST = ['led', 'developed', 'managed', 'created', 'built', 'designed', 'implemented', 'architected', 'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'launched', 'drafted', 'translated', 'conducted', 'proposed', 'analyzed', 'established', 'coordinated', 'executed', 'spearheaded', 'generated', 'configured', 'deployed', 'integrated', 'automated', 'streamlined', 'evaluated', 'identified', 'produced', 'trained', 'mentored', 'researched', 'collaborated', 'designed', 'earned', 'completed', 'developed', 'presented', 'supported', 'maintained', 'reviewed'];
    const actionVerbsCount = ACTION_VERB_LIST.filter(verb => resumeLower.includes(verb)).length;
    const totalWords = parsedResume.rawText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const rawMetrics = parsedResume.rawText.match(/\d+%|\$[\d,]+[KMB]?|\d+x\b|\d+\+\s*(users|customers|projects|templates|prompts|certifications|skills|tools|models|workflows|applications|services|endpoints|requests|downloads|clients|AI|cloud)|\d{2,}\+/gi) || [];
    const quantifiedMetrics = [...new Set(rawMetrics.map((m: string) => m.toLowerCase()))];

    let keywordCoverage: TransparentJDAlignmentScore | null = null;
    if (jobDescription) {
        const jdResult = await safeExecute('jdAlignment', () => computeTransparentJDAlignmentScore({
            resumeText: parsedResume.rawText,
            jobDescriptionText: cleanedJD.cleanedText,
            extractedSkills: resumeSkills.normalizedSkills.map(s => s.canonical),
            jdSkills: jdSkills.normalizedSkills.map(s => s.canonical),
            sections: Object.keys(sectionResults.sections || {}).map(name => ({
                name,
                found: true,
                wordCount: (sectionResults.sections[name]?.content || '').split(/\s+/).length,
            })),
            actionVerbsCount: actionVerbsCount,
            quantifiedMetricsCount: quantifiedMetrics.length,
            totalWords: totalWords,
            careerStage: stageClassification.stage
        }), null);
        keywordCoverage = jdResult.data;

        if (keywordCoverage && evidenceStrength) {
            keywordCoverage.overallScore = applyRealismDirective(keywordCoverage.overallScore, evidenceStrength.confidenceModifier);
        }
    }

    // 9. Market Calibration
    let calibration: MarketCalibration | null = null;
    if (keywordCoverage) {
        const calibrationResult = await safeExecute('marketCalibration', () => calibrateJDAlignmentScore(
            keywordCoverage!.overallScore,
            stageClassification.stage,
            undefined
        ), null);
        calibration = calibrationResult.data;
    }

    // STEP 1: Try the user-provided GitHub input first
    // This is ALWAYS the highest priority source
    let resolvedGithubUsername: string | null = null;

    if (githubUsername && githubUsername.trim().length > 0) {
        // Extract clean username from whatever they pasted
        // Handles: "Aaradhy-singh" or 
        //          "https://github.com/Aaradhy-singh" or
        //          "github.com/Aaradhy-singh"
        const fromInput = githubUsername.trim()
            .replace(/^https?:\/\//i, '')
            .replace(/^github\.com\//i, '')
            .replace(/\/.*$/, '')  // remove anything after /
            .trim();

        if (fromInput.length >= 1 && 
            fromInput.length <= 39 &&
            !fromInput.includes(' ') &&
            /^[a-zA-Z0-9][a-zA-Z0-9\-]*$/.test(fromInput)) {
            resolvedGithubUsername = fromInput;
        }

        console.log('[GitHub Debug]', {
            paramReceived: githubUsername,
            resolved: resolvedGithubUsername
        });
    }

    // STEP 2: ONLY if user gave no input at all,
    // try extracting from resume text
    // But be very strict — only match profile URLs
    // not library/project references
    if (!resolvedGithubUsername && parsedResume.rawText) {
        const profileUrlPattern = 
            /github\.com\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,38})\s*$/im;
        const match = parsedResume.rawText.match(profileUrlPattern);
        if (match && match[1]) {
            const candidate = match[1];
            // Extra safety: reject known non-profile paths
            const isNotARepo = 
                !candidate.includes('/') &&
                candidate.toLowerCase() !== 'topics' &&
                candidate.toLowerCase() !== 'explore' &&
                candidate.toLowerCase() !== 'trending' &&
                candidate.toLowerCase() !== 'marketplace' &&
                candidate.toLowerCase() !== 'features' &&
                candidate.toLowerCase() !== 'p';
            if (isNotARepo) {
                resolvedGithubUsername = candidate;
            }
        }
    }

    // STEP 3: Only call GitHub API if we have a 
    // clean resolved username
    let portfolioAnalysis: PortfolioAnalysis | null = null;
    if (resolvedGithubUsername) {
        const portfolioResult = await safeExecute(
            'portfolioAnalysis',
            () => analyzeGitHubPortfolio(
                resolvedGithubUsername!,
                stageClassification.stage
            ),
            null
        );
        portfolioAnalysis = portfolioResult.data ?? null;
    }
    const multiFactorContext: MultiFactorContext = {
        careerStage: stageClassification.stage,
        totalExperienceYears: manualExperienceYears !== undefined
            ? manualExperienceYears
            : stageClassification.signals.totalExperienceYears,
        projectComplexityScore: projectComplexity?.overallScore || 0,
        portfolioScore: 0,
        certificationCount: stageClassification.signals.certificationCount,
        relevantCertifications: [],
    };

    const rolesResult = await safeExecute('roleMatching',
        () => matchToAllWeightedRoles(resumeSkills.normalizedSkills, 20, multiFactorContext),
        []
    );
    const rawRoleMatches = rolesResult.data!;

    const filteredResult = await safeExecute('roleFiltering',
        () => filterRolesByStage(rawRoleMatches.map(m => ({ title: m.occupation.title, ...m })), stageClassification.stage),
        []
    );
    const stageFilteredRoles = filteredResult.data!;

    // If the user specified a target role, promote the closest match to the front
    let prioritisedRoles = stageFilteredRoles;
    if (manualTargetRole && manualTargetRole.trim().length > 0) {
        const needle = manualTargetRole.toLowerCase();
        const idx = prioritisedRoles.findIndex(r =>
            r.occupation?.title?.toLowerCase().includes(needle) ||
            needle.includes(r.occupation?.title?.toLowerCase() ?? '')
        );
        if (idx > 0) {
            prioritisedRoles = [
                prioritisedRoles[idx],
                ...prioritisedRoles.slice(0, idx),
                ...prioritisedRoles.slice(idx + 1),
            ];
        }
    }

    const topMatch = prioritisedRoles.find(r => r.fitLevel === 'perfect' || r.fitLevel === 'reach') || prioritisedRoles[0];
    const topRoles = prioritisedRoles.slice(0, 3);

    // 11. Keyword Gap Analysis
    const gapAnalysisResult = await safeExecute('gapAnalysis', () => analyzeKeywordGaps(parsedResume.rawText, jobDescription || null), null);
    const gapAnalysis = gapAnalysisResult.data;

    // 13. Bullet Rewrites
    const bulletPoints = parsedResume.rawText.split('\n').map(l => l.trim()).filter(l => /^[•\-*]/.test(l) && l.length > 20).slice(0, 5);
    const rewriteResult = await safeExecute('bulletRewrite', () => rewriteResumeBullets(bulletPoints), []);
    const rewrittenBullets = rewriteResult.data!;

    // 14. Format Risk
    const formatRiskResult = await safeExecute('formatRisk', () => computeParsingReliability(parsedResume.rawText), { parsingReliabilityScore: 0, risks: [], hasMultiColumn: false, hasTables: false, hasGraphics: false, recommendation: '' });
    const formatRisk = formatRiskResult.data!;

    // 15. Specificity Report
    const specificityResult = await safeExecute('specificityReport', () => computeSpecificityReport(parsedResume.rawText), null);
    const specificityReport = specificityResult.data;

    // 16. Recommendations
    globalBenchmark.startMarker('recommendations');
    const deficiencies: AnalysisDeficiency[] = [];
    if (gapAnalysis) {
        gapAnalysis.criticalGaps.forEach(gap => deficiencies.push({
            type: 'keyword-gap', severity: 85, details: { keyword: gap.keyword, importance: 'critical', jdFrequency: gap.frequency, suggestedSection: 'Skills' }
        }));
    }
    if (keywordCoverage && keywordCoverage.overallScore < 70) {
        if (keywordCoverage.factors.sectionCompleteness.score < 80) {
            deficiencies.push({
                type: 'section-incomplete', severity: 70, details: { missingSections: Object.keys(sectionResults.sections || {}).length < 4 ? ['Summary', 'Projects'] : [], score: keywordCoverage.factors.sectionCompleteness.score }
            });
        }
    }
    if (rawRoleMatches.length > 0) {
        const tr = rawRoleMatches[0];
        tr.missingCrucialSkills.slice(0, 3).forEach(skill => deficiencies.push({ type: 'skill-gap', severity: 80, details: { skill, skillType: 'core', weight: 3, scoreImpact: 10, estimatedLearningTime: '2-4 weeks' }, targetRole: tr.occupation.title }));
    }
    if (portfolioAnalysis && portfolioAnalysis.insights.documentationScore < 50) {
        deficiencies.push({ type: 'portfolio-weakness', severity: 60, details: { weakness: 'poor-documentation', avgLength: 100, score: portfolioAnalysis.insights.documentationScore } });
    }

    // Missing: fire portfolio deficiency when no GitHub at all
    if (!portfolioAnalysis) {
        deficiencies.push({
            type: 'portfolio-weakness',
            severity: 65,
            details: {
                weakness: 'no-live-demos',
                liveCount: 0,
                totalProjects: 0,
                score: 0,
            }
        });
    }

    // Missing: fire format deficiency when parsing reliability is low
    if (formatRisk.parsingReliabilityScore < 70) {
        deficiencies.push({
            type: 'ats-score',
            severity: 80,
            details: {
                factor: 'keyword-match',
                score: formatRisk.parsingReliabilityScore,
            }
        });
    }

    // Missing: fire project complexity deficiency when score is low
    if (projectComplexity && projectComplexity.overallScore < 30) {
        deficiencies.push({
            type: 'section-incomplete',
            severity: 60,
            details: {
                missingSections: ['Projects'],
                score: projectComplexity.overallScore,
            }
        });
    }

    let recommendations = generateRecommendations(deficiencies);
    const intrinsicRecs = buildIntrinsicDeficiencies({ resumeText: parsedResume.rawText, quantifiedMetricsCount: quantifiedMetrics.length, actionVerbsCount: actionVerbsCount, extractedSkills: resumeSkills.normalizedSkills.map(s => s.canonical), totalWords: totalWords });
    recommendations = [...recommendations, ...intrinsicRecs];
    recommendations = attachImpactSimulations(recommendations, { keywordCoverageScore: keywordCoverage?.overallScore || 0, roleMatchScore: rawRoleMatches[0]?.matchScore || 0 });
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => (priorityOrder[a.priorityLevel] ?? 3) - (priorityOrder[b.priorityLevel] ?? 3));

    // 17. Pipeline Integrity
    const integrityResult = await safeExecute('pipelineIntegrity', () => validatePipelineIntegrity({ evidenceVerified: true, careerStage: stageClassification, keywordCoverage, normalizedSkills: resumeSkills.normalizedSkills, roleMatches: rawRoleMatches, evidenceStrength, calibration, projectComplexity, recommendations }), null);
    const pipelineIntegrity = integrityResult.data;

    globalBenchmark.endMarker('total_pipeline');

    return {
        meta: { version: '3.0.0-verifiable', timestamp: new Date().toISOString(), evidenceVerified: true, pipelineErrors: pipelineErrors },
        parsedProfile: { rawText: parsedResume.rawText, sections: sectionResults, skills: resumeSkills },
        careerStage: stageClassification,
        scores: { keywordCoverage: keywordCoverage, portfolio: portfolioAnalysis, format: formatRisk },
        roles: { matches: rawRoleMatches, stageFiltered: prioritisedRoles, topRoles: topRoles },
        gaps: gapAnalysis,
        improvements: { rewrittenBullets },
        recommendations,
        calibration,
        projectComplexity,
        evidenceStrength,
        pipelineIntegrity,
        specificityReport,
    };
}
