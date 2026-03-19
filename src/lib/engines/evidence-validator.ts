/**
 * Evidence Validator
 * Detects and prevents hallucinated content in resume rewrites
 * PRIMARY DIRECTIVE: Accuracy over impressiveness
 */

export interface ExtractedMetric {
    type: 'percentage' | 'money' | 'multiplier' | 'count' | 'scale';
    value: string;
    context: string; // Surrounding text for verification
    position: number;
}

export interface ValidationResult {
    valid: boolean;
    violations: HallucinationViolation[];
    confidence: number; // 0-100
    safeToUse: boolean;
}

export interface HallucinationViolation {
    type: 'fabricated_metric' | 'inflated_claim' | 'fake_leadership' | 'fake_scale' | 'unverified_achievement';
    severity: 'critical' | 'warning' | 'info';
    description: string;
    originalText?: string;
    rewrittenText?: string;
}

/**
 * Extract quantified metrics from text
 */
export function extractMetrics(text: string): ExtractedMetric[] {
    const metrics: ExtractedMetric[] = [];

    // Percentage patterns: 50%, 3.5%
    const percentageRegex = /(\d+(?:\.\d+)?%)/g;
    let match;
    while ((match = percentageRegex.exec(text)) !== null) {
        metrics.push({
            type: 'percentage',
            value: match[1],
            context: text.slice(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[1].length + 20)),
            position: match.index,
        });
    }

    // Money patterns: $100K, $1M, $500,000
    const moneyRegex = /\$[\d,]+(?:K|M|B)?/g;
    while ((match = moneyRegex.exec(text)) !== null) {
        metrics.push({
            type: 'money',
            value: match[0],
            context: text.slice(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)),
            position: match.index,
        });
    }

    // Multiplier patterns: 3x, 10x
    const multiplierRegex = /(\d+x)/gi;
    while ((match = multiplierRegex.exec(text)) !== null) {
        metrics.push({
            type: 'multiplier',
            value: match[1],
            context: text.slice(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[1].length + 20)),
            position: match.index,
        });
    }

    // Count patterns: 10K+, 100K users, 1M downloads
    const countRegex = /(\d+K?\+?)\s*(users|downloads|requests|customers|clients|employees)/gi;
    while ((match = countRegex.exec(text)) !== null) {
        metrics.push({
            type: 'count',
            value: match[0],
            context: text.slice(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)),
            position: match.index,
        });
    }

    // Scale patterns: distributed, microservices, 100+ servers
    const scaleRegex = /(\d+\+?)\s*(servers|services|microservices|nodes|instances)/gi;
    while ((match = scaleRegex.exec(text)) !== null) {
        metrics.push({
            type: 'scale',
            value: match[0],
            context: text.slice(Math.max(0, match.index - 20), Math.min(text.length, match.index + match[0].length + 20)),
            position: match.index,
        });
    }

    return metrics;
}

/**
 * Extract leadership claims from text
 */
export function extractLeadershipClaims(text: string): string[] {
    const claims: string[] = [];

    const patterns = [
        /(?:led|managed|mentored|supervised)\s+(?:a\s+)?team\s+of\s+\d+/gi,
        /managed\s+\d+\s+(?:engineers|developers|people|members)/gi,
        /led\s+\d+\s+(?:engineers|developers|people|members)/gi,
        /team\s+lead/gi,
        /technical\s+lead/gi,
        /engineering\s+manager/gi,
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            claims.push(...matches);
        }
    });

    return [...new Set(claims)];
}

/**
 * Validate that rewritten text doesn't introduce new metrics
 */
export function validateRewrite(original: string, rewritten: string): ValidationResult {
    const originalMetrics = extractMetrics(original);
    const rewrittenMetrics = extractMetrics(rewritten);

    const originalLeadership = extractLeadershipClaims(original);
    const rewrittenLeadership = extractLeadershipClaims(rewritten);

    const violations: HallucinationViolation[] = [];

    // Check for fabricated metrics
    for (const rewrittenMetric of rewrittenMetrics) {
        const found = originalMetrics.some(orig =>
            orig.value === rewrittenMetric.value ||
            orig.context.includes(rewrittenMetric.value)
        );

        if (!found) {
            violations.push({
                type: 'fabricated_metric',
                severity: 'critical',
                description: `New metric "${rewrittenMetric.value}" not found in original text. This is a hallucination.`,
                originalText: original,
                rewrittenText: rewritten,
            });
        }
    }

    // Check for fake leadership claims
    for (const rewrittenClaim of rewrittenLeadership) {
        const found = originalLeadership.some(orig =>
            orig.toLowerCase() === rewrittenClaim.toLowerCase() ||
            original.toLowerCase().includes(rewrittenClaim.toLowerCase())
        );

        if (!found) {
            violations.push({
                type: 'fake_leadership',
                severity: 'critical',
                description: `New leadership claim "${rewrittenClaim}" not found in original. Cannot fabricate leadership experience.`,
                originalText: original,
                rewrittenText: rewritten,
            });
        }
    }

    // Check for inflated scale claims
    const scaleKeywords = ['distributed', 'microservices', 'cloud-native', 'serverless', 'kubernetes', 'at scale'];
    for (const keyword of scaleKeywords) {
        const inOriginal = original.toLowerCase().includes(keyword);
        const inRewritten = rewritten.toLowerCase().includes(keyword);

        if (inRewritten && !inOriginal) {
            violations.push({
                type: 'fake_scale',
                severity: 'warning',
                description: `Added scale keyword "${keyword}" not present in original. May be inflating technical scope.`,
                originalText: original,
                rewrittenText: rewritten,
            });
        }
    }

    // Check for achievement inflation
    const achievementKeywords = ['achieved', 'delivered', 'increased', 'reduced', 'improved', 'optimized'];
    let originalAchievementCount = 0;
    let rewrittenAchievementCount = 0;

    achievementKeywords.forEach(keyword => {
        originalAchievementCount += (original.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
        rewrittenAchievementCount += (rewritten.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    });

    if (rewrittenAchievementCount > originalAchievementCount + 2) {
        violations.push({
            type: 'inflated_claim',
            severity: 'warning',
            description: `Achievement verb count increased from ${originalAchievementCount} to ${rewrittenAchievementCount}. May be over-inflating accomplishments.`,
            originalText: original,
            rewrittenText: rewritten,
        });
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const valid = criticalViolations.length === 0;
    const safeToUse = violations.length === 0;

    // Confidence: 100% if no violations, decreases with severity
    let confidence = 100;
    violations.forEach(v => {
        if (v.severity === 'critical') confidence -= 30;
        else if (v.severity === 'warning') confidence -= 10;
        else confidence -= 5;
    });
    confidence = Math.max(0, confidence);

    return {
        valid,
        violations,
        confidence,
        safeToUse,
    };
}

/**
 * Check if a transformation is allowed
 */
export function isAllowedTransformation(
    original: string,
    transformed: string
): { allowed: boolean; reason?: string } {
    // Check length change (shouldn't add too much content)
    const lengthRatio = transformed.length / original.length;
    if (lengthRatio > 1.5) {
        return {
            allowed: false,
            reason: 'Rewrite adds too much new content (>50% length increase)',
        };
    }

    // Check that core nouns/entities are preserved
    const originalWords = new Set(original.toLowerCase().match(/\b\w{4,}\b/g) || []);
    const transformedWords = new Set(transformed.toLowerCase().match(/\b\w{4,}\b/g) || []);

    const preservedWords = [...originalWords].filter(word => transformedWords.has(word));
    const preservationRate = preservedWords.length / originalWords.size;

    if (preservationRate < 0.5) {
        return {
            allowed: false,
            reason: 'Rewrite changes too many core terms (<50% preservation)',
        };
    }

    return { allowed: true };
}

/**
 * Get evidence source for a claim
 */
function getEvidenceSource(
    claim: string,
    resumeText: string,
    jdText?: string,
    githubData?: unknown
): 'resume-extracted' | 'jd-derived' | 'portfolio-computed' | 'ai-inferred' {
    const normalizedClaim = claim.toLowerCase();

    if (resumeText.toLowerCase().includes(normalizedClaim)) {
        return 'resume-extracted';
    }

    if (jdText && jdText.toLowerCase().includes(normalizedClaim)) {
        return 'jd-derived';
    }

    if (githubData) {
        // Check if claim relates to GitHub data
        const githubString = JSON.stringify(githubData).toLowerCase();
        if (githubString.includes(normalizedClaim)) {
            return 'portfolio-computed';
        }
    }

    return 'ai-inferred'; // FLAG THIS
}
