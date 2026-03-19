/**
 * Evidence Strength Index
 * 
 * Global metric measuring the quality and verifiability of evidence
 * in a resume. Low evidence strength reduces confidence in all outputs.
 * 
 * Sub-scores:
 * 1. Verifiable Metrics Density (% of bullets with numbers)
 * 2. Dated Experience Coverage (% of entries with date ranges)
 * 3. Project Documentation Quality (word count, tech mentions per project)
 * 4. Skill Validation Frequency (skills mentioned in context vs bare lists)
 */

export interface EvidenceStrengthDimension {
    name: string;
    score: number;          // 0-100
    weight: number;         // Contribution percentage
    details: string;        // Human-readable explanation
}

export interface EvidenceStrengthResult {
    overallScore: number;           // 0-100
    dimensions: EvidenceStrengthDimension[];
    confidenceModifier: number;     // Multiplier 0.5-1.0 applied to other scores
    tier: 'strong' | 'moderate' | 'weak' | 'insufficient';
    summary: string;
    warnings: string[];
}

/**
 * Measure verifiable metrics density
 * What % of bullet points or sentences contain quantified data?
 */
function measureMetricsDensity(resumeText: string): EvidenceStrengthDimension {
    const lines = resumeText.split('\n').filter(l => l.trim().length > 15);
    const metricsPattern = /\d+%|\$[\d,]+|\d+x|\d+K?\+?\s*(users|customers|revenue|transactions|downloads|requests|projects|applications|services|endpoints)/gi;

    let linesWithMetrics = 0;
    lines.forEach(line => {
        if (metricsPattern.test(line)) {
            linesWithMetrics++;
        }
        metricsPattern.lastIndex = 0;
    });

    const density = lines.length > 0 ? (linesWithMetrics / lines.length) * 100 : 0;
    const score = Math.min(100, Math.round(density * 4)); // 25% density = 100

    return {
        name: 'Verifiable Metrics Density',
        score,
        weight: 30,
        details: `${linesWithMetrics} of ${lines.length} content lines contain quantified metrics (${Math.round(density)}%).`,
    };
}

/**
 * Measure dated experience coverage
 * What % of experience entries have parseable date ranges?
 */
function measureDateCoverage(resumeText: string): EvidenceStrengthDimension {
    // Count experience-like sections
    const experienceIndicators = (resumeText.match(/\b(experience|employment|work\s+history|internship|job)\b/gi) || []).length;

    // Count date patterns
    const datePatterns = [
        /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}/gi,
        /\b\d{4}\s*[-–]\s*(?:\d{4}|present|current)\b/gi,
        /\b\d{1,2}\/\d{4}/gi,
    ];

    let totalDates = 0;
    datePatterns.forEach(pattern => {
        const matches = resumeText.match(pattern) || [];
        totalDates += matches.length;
    });

    // Each experience entry should have 2 dates (start-end), so expected = indicators * 2
    const expectedDates = Math.max(experienceIndicators, 1) * 2;
    const coverage = Math.min(100, Math.round((totalDates / expectedDates) * 100));

    return {
        name: 'Dated Experience Coverage',
        score: coverage,
        weight: 25,
        details: `Found ${totalDates} date references across ~${experienceIndicators} experience indicators. Coverage: ${coverage}%.`,
    };
}

/**
 * Measure project documentation quality
 * Average word count and technology mentions per project section
 */
function measureProjectDocQuality(resumeText: string): EvidenceStrengthDimension {
    // Rough project extraction
    const projectSections = resumeText.split(/\n/).reduce<string[]>((acc, line) => {
        if (/\bproject\b/i.test(line) && line.trim().length > 10) {
            acc.push(line);
        }
        return acc;
    }, []);

    const projectCount = Math.max(projectSections.length, 1);

    // Count tech mentions in project areas
    const techMentions = (resumeText.match(
        /\b(react|angular|vue|python|java|node|express|django|flask|mongodb|postgresql|mysql|docker|kubernetes|aws|azure|gcp|typescript|javascript|redis|graphql|rest\s*api|firebase|supabase)\b/gi
    ) || []).length;

    // Word count for project-related text
    const projectWordDensity = techMentions / projectCount;

    let score: number;
    if (projectWordDensity >= 4) score = 100;
    else if (projectWordDensity >= 2) score = 70;
    else if (projectWordDensity >= 1) score = 40;
    else score = 15;

    return {
        name: 'Project Documentation Quality',
        score,
        weight: 20,
        details: `${techMentions} technology mentions across ${projectCount} project references. Density: ${projectWordDensity.toFixed(1)} per project.`,
    };
}

/**
 * Measure skill validation frequency
 * Are skills mentioned in context (experience/projects) or only in a bare skills list?
 */
function measureSkillValidation(resumeText: string): EvidenceStrengthDimension {
    // Extract skills section (rough heuristic)
    const skillsSectionMatch = resumeText.match(/skills?\s*[:.\n]([\s\S]{20,500}?)(?:\n\s*\n|\n[A-Z])/i);
    const skillsList = skillsSectionMatch ? skillsSectionMatch[1] : '';

    // Extract skills mentioned in the skills section
    const skillTerms = skillsList
        .split(/[,;|•\n]/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length >= 2 && s.length <= 30);

    if (skillTerms.length === 0) {
        return {
            name: 'Skill Validation Frequency',
            score: 20,
            weight: 25,
            details: 'No clear skills section detected. Cannot measure validation frequency.',
        };
    }

    // Check how many skills appear outside the skills section
    const restOfResume = resumeText.replace(skillsList, '').toLowerCase();
    let validatedCount = 0;

    skillTerms.forEach(skill => {
        if (skill.length >= 3) {
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            if (regex.test(restOfResume)) {
                validatedCount++;
            }
        }
    });

    const validationRate = Math.round((validatedCount / skillTerms.length) * 100);
    const score = Math.min(100, validationRate);

    return {
        name: 'Skill Validation Frequency',
        score,
        weight: 25,
        details: `${validatedCount} of ${skillTerms.length} listed skills are also mentioned in experience/projects (${validationRate}% validated).`,
    };
}

/**
 * Determine evidence tier from overall score
 */
function getEvidenceTier(score: number): 'strong' | 'moderate' | 'weak' | 'insufficient' {
    if (score >= 70) return 'strong';
    if (score >= 50) return 'moderate';
    if (score >= 30) return 'weak';
    return 'insufficient';
}

/**
 * Compute the global Evidence Strength Index for a resume.
 * Low scores reduce confidence in all downstream outputs.
 */
export function computeEvidenceStrength(resumeText: string): EvidenceStrengthResult {
    const dimensions = [
        measureMetricsDensity(resumeText),
        measureDateCoverage(resumeText),
        measureProjectDocQuality(resumeText),
        measureSkillValidation(resumeText),
    ];

    // Weighted overall score
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const overallScore = Math.round(
        dimensions.reduce((sum, d) => sum + (d.score * d.weight), 0) / totalWeight
    );

    const tier = getEvidenceTier(overallScore);

    // Confidence modifier: maps 0-100 score to 0.5-1.0 multiplier
    const confidenceModifier = Math.round((0.5 + (overallScore / 100) * 0.5) * 100) / 100;

    // Generate warnings
    const warnings: string[] = [];
    dimensions.forEach(d => {
        if (d.score < 25) {
            warnings.push(`Low ${d.name}: ${d.details}`);
        }
    });

    if (overallScore < 50) {
        warnings.push('Overall evidence strength is low. All output scores should be interpreted with caution.');
    }

    // Summary
    const strongDimensions = dimensions.filter(d => d.score >= 60).map(d => d.name);
    const weakDimensions = dimensions.filter(d => d.score < 30).map(d => d.name);

    let summary = `Evidence strength: ${tier} (${overallScore}/100). Confidence modifier: ${confidenceModifier}.`;
    if (strongDimensions.length > 0) {
        summary += ` Strong: ${strongDimensions.join(', ')}.`;
    }
    if (weakDimensions.length > 0) {
        summary += ` Weak: ${weakDimensions.join(', ')}.`;
    }

    return {
        overallScore,
        dimensions,
        confidenceModifier,
        tier,
        summary,
        warnings,
    };
}
