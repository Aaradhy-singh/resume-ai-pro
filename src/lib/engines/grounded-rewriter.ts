/**
 * Grounded Rewriter
 * Evidence-based resume text transformation
 * ZERO TOLERANCE for unsupported claims
 */

import { validateRewrite, isAllowedTransformation } from './evidence-validator';

export interface RewriteRule {
    name: string;
    description: string;
    apply: (text: string) => string;
    safe: boolean; // Whether this rule can introduce unsupported claims
}

export interface GroundedRewrite {
    original: string;
    rewritten: string;
    transformations: string[]; // Which rules were applied
    validated: boolean;
    safe: boolean;
    violations: string[];
    verbDowngrades: VerbDowngrade[]; // Scope exaggeration downgrades applied
}

export interface VerbDowngrade {
    original: string;
    replacement: string;
    reason: string;
}

/**
 * ALLOWED TRANSFORMATION RULES
 * These are safe and evidence-preserving
 */

// Rule 1: Grammar improvements
const improveGrammar: RewriteRule = {
    name: 'grammar',
    description: 'Fix grammatical errors and tense consistency',
    safe: true,
    apply: (text: string) => {
        let improved = text;

        // Fix subject-verb agreement (simple cases)
        improved = improved.replace(/\bI was work\b/gi, 'I worked');
        improved = improved.replace(/\bI were\b/gi, 'I was');

        return improved;
    },
};

// Rule 2: Action verb strengthening
const strengthenActionVerbs: RewriteRule = {
    name: 'action_verbs',
    description: 'Replace weak verbs with stronger alternatives',
    safe: true,
    apply: (text: string) => {
        const verbReplacements: Record<string, string> = {
            'worked on': 'developed',
            'helped with': 'contributed to',
            'was responsible for': 'managed',
            'did': 'executed',
            'made': 'created',
            'used': 'utilized',
            'coordinated with': 'collaborated with',
        };

        let strengthened = text;
        Object.entries(verbReplacements).forEach(([weak, strong]) => {
            const regex = new RegExp(`\\b${weak}\\b`, 'gi');
            strengthened = strengthened.replace(regex, strong);
        });

        return strengthened;
    },
};

// Rule 3: Bullet restructuring (move verb to start)
const restructureBullets: RewriteRule = {
    name: 'bullet_structure',
    description: 'Restructure bullets to start with action verbs',
    safe: true,
    apply: (text: string) => {
        // Pattern: "System for X that does Y" → "Built system for X that does Y"
        let restructured = text;

        // If text doesn't start with verb, try to add appropriate one
        const startsWithVerb = /^(built|developed|created|designed|implemented|led|managed|achieved)/i.test(text);

        if (!startsWithVerb && !text.match(/^[•\-*]/)) {
            // Check for common noun starts
            if (/^(system|application|tool|feature|service|platform)/i.test(text)) {
                restructured = `Developed ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
            }
        }

        return restructured;
    },
};

const alignKeywords: RewriteRule = {
    name: 'keyword_alignment',
    description: 'Add JD keywords only if semantically appropriate',
    safe: false, // Requires careful validation
    apply: (text: string, jdKeywords?: string[]) => {
        if (!jdKeywords || jdKeywords.length === 0) return text;

        // This is a placeholder - in real implementation, would use NLP
        // to determine if keywords are semantically appropriate to add
        return text;
    },
};

const outcomeGap: RewriteRule = {
    name: 'outcome_gap',
    description: 'Flag bullets missing outcome or impact',
    safe: true,
    apply: (text: string) => {
        // Check if bullet already has an outcome indicator
        const hasOutcome = /\b(result|impact|led to|enabling|resulting|which|so that|allowing|helping|increas|decreas|reduc|improv|achiev|generat|sav|deliver)\b/i.test(text);
        const hasMetric = /\d+%|\d+\+|\$[\d]|[\d]+x\b/i.test(text);

        if (!hasOutcome && !hasMetric && text.length > 30) {
            // Append a suggestion marker — do NOT change the text
            // Return the original — this rule only flags
            return text;
        }
        return text;
    }
};

const passiveToActive: RewriteRule = {
    name: 'passive_to_active',
    description: 'Convert passive voice to active voice',
    safe: true,
    apply: (text: string) => {
        let improved = text;
        // Common passive patterns with safe replacements
        improved = improved.replace(
            /^was responsible for ([a-z])/i,
            (_, c) => `Managed ${c}`
        );
        improved = improved.replace(
            /^helped (to )?([a-z])/i,
            (_, _2, c) => `Supported ${c}`
        );
        improved = improved.replace(
            /^worked on ([a-z])/i,
            (_, c) => `Developed ${c}`
        );
        improved = improved.replace(
            /^assisted (in|with) ([a-z])/i,
            (_, _2, c) => `Contributed to ${c}`
        );
        improved = improved.replace(
            /^was involved in ([a-z])/i,
            (_, c) => `Participated in ${c}`
        );
        return improved;
    }
};

const vagueQuantifiers: RewriteRule = {
    name: 'vague_quantifiers',
    description: 'Flag vague quantity words',
    safe: true,
    apply: (text: string) => {
        let improved = text;
        // Only replace if no real number exists nearby
        if (!/\d/.test(text)) {
            improved = improved.replace(/\bmultiple\b/gi, 'several');
            improved = improved.replace(/\bvarious\b/gi, 'multiple');
        }
        return improved;
    }
};

const structureCheck: RewriteRule = {
    name: 'structure_check',
    description: 'Check bullet has Action + Task + Context',
    safe: true,
    apply: (text: string) => {
        return text;
    }
};

/**
 * FORBIDDEN TRANSFORMATIONS
 * These WILL introduce unsupported claims
 */

const FORBIDDEN_PATTERNS = [
    /\d+%/, // Don't add percentages
    /\$\d+/, // Don't add money amounts
    /\d+x/, // Don't add multipliers
    /\d+K?\+?\s*(users|customers|clients)/, // Don't add user counts
    /led\s+team/, // Don't add leadership if not present
    /managed\s+\d+/, // Don't add team size
    /\d+\s*servers?/, // Don't add scale metrics
];

/**
 * SCOPE EXAGGERATION RULES
 * Each verb requires specific evidence in the original text.
 * If evidence is absent, the verb is downgraded to a neutral equivalent.
 */
const SCOPE_EXAGGERATION_RULES: Array<{
    verb: string;
    pattern: RegExp;
    evidencePatterns: RegExp[];
    downgrade: string;
    reason: string;
}> = [
        {
            verb: 'Architected',
            pattern: /\barchitected\b/gi,
            evidencePatterns: [
                /\b(architecture|system\s+design|microservice|design\s+pattern|distributed|scalable\s+system)\b/i,
            ],
            downgrade: 'Built',
            reason: '"Architected" requires system design evidence (architecture, microservices, design patterns)',
        },
        {
            verb: 'Led',
            pattern: /\bled\b/gi,
            evidencePatterns: [
                /\b(team|people|members|reports|direct|group|squad|engineers)\b/i,
            ],
            downgrade: 'Contributed to',
            reason: '"Led" requires team indicators (team, members, reports)',
        },
        {
            verb: 'Scaled',
            pattern: /\bscaled\b/gi,
            evidencePatterns: [
                /\b(\d+\s*users|\d+\s*servers|traffic|load|throughput|requests\s*per|concurrent|million|100k)\b/i,
            ],
            downgrade: 'Improved',
            reason: '"Scaled" requires user or infrastructure metrics',
        },
        {
            verb: 'Engineered',
            pattern: /\bengineered\b/gi,
            evidencePatterns: [
                /\b(system|platform|infrastructure|pipeline|framework|engine|service)\b/i,
            ],
            downgrade: 'Developed',
            reason: '"Engineered" requires system-level implementation evidence',
        },
        {
            verb: 'Spearheaded',
            pattern: /\bspearheaded\b/gi,
            evidencePatterns: [
                /\b(initiative|launch|project\s+lead|drove|champion|owner|founding)\b/i,
            ],
            downgrade: 'Worked on',
            reason: '"Spearheaded" requires initiative or leadership evidence',
        },
    ];

/**
 * Validate verb usage against evidence and downgrade if unsupported.
 * Returns the text with downgrades applied and a list of changes made.
 */
function validateVerbUsage(original: string, rewritten: string): {
    text: string;
    downgrades: VerbDowngrade[];
} {
    let result = rewritten;
    const downgrades: VerbDowngrade[] = [];

    for (const rule of SCOPE_EXAGGERATION_RULES) {
        // Only check if the verb appears in the rewritten text
        if (!rule.pattern.test(result)) continue;

        // Check if evidence exists in the ORIGINAL text
        const hasEvidence = rule.evidencePatterns.some(p => p.test(original));

        if (!hasEvidence) {
            // Reset lastIndex for global regex
            rule.pattern.lastIndex = 0;
            result = result.replace(rule.pattern, rule.downgrade);
            downgrades.push({
                original: rule.verb,
                replacement: rule.downgrade,
                reason: rule.reason,
            });
        }
    }

    return { text: result, downgrades };
}

/**
 * Apply grounded rewrite with validation
 */
export function applyGroundedRewrite(
    original: string,
    options: {
        enableGrammar?: boolean;
        enableActionVerbs?: boolean;
        enableRestructuring?: boolean;
        jdKeywords?: string[];
    } = {}
): GroundedRewrite {
    let rewritten = original;
    const transformations: string[] = [];

    // Apply safe transformations
    if (options.enableGrammar !== false) {
        const before = rewritten;
        rewritten = improveGrammar.apply(rewritten);
        if (rewritten !== before) {
            transformations.push(improveGrammar.name);
        }
    }

    if (options.enableActionVerbs !== false) {
        const before = rewritten;
        rewritten = strengthenActionVerbs.apply(rewritten);
        if (rewritten !== before) {
            transformations.push(strengthenActionVerbs.name);
        }

        const beforePassive = rewritten;
        rewritten = passiveToActive.apply(rewritten);
        if (rewritten !== beforePassive) {
            transformations.push(passiveToActive.name);
        }

        const beforeVague = rewritten;
        rewritten = vagueQuantifiers.apply(rewritten);
        if (rewritten !== beforeVague) {
            transformations.push(vagueQuantifiers.name);
        }
    }

    if (options.enableRestructuring !== false) {
        const before = rewritten;
        rewritten = restructureBullets.apply(rewritten);
        if (rewritten !== before) {
            transformations.push(restructureBullets.name);
        }
    }

    // SCOPE EXAGGERATION GUARD: Validate verb usage against evidence
    const verbCheck = validateVerbUsage(original, rewritten);
    rewritten = verbCheck.text;
    if (verbCheck.downgrades.length > 0) {
        transformations.push('verb_scope_guard');
    }

    // Validate the rewrite
    const validation = validateRewrite(original, rewritten);
    const transformCheck = isAllowedTransformation(original, rewritten);

    const violations: string[] = [];
    if (!validation.valid) {
        violations.push(...validation.violations.map(v => v.description));
    }
    if (!transformCheck.allowed && transformCheck.reason) {
        violations.push(transformCheck.reason);
    }

    return {
        original,
        rewritten: validation.safeToUse ? rewritten : original, // Revert if unsafe
        transformations,
        validated: validation.valid,
        safe: validation.safeToUse,
        violations,
        verbDowngrades: verbCheck.downgrades,
    };
}

/**
 * Batch rewrite resume bullets with validation
 */
export function rewriteResumeBullets(
    bullets: string[],
    options: {
        enableGrammar?: boolean;
        enableActionVerbs?: boolean;
        enableRestructuring?: boolean;
    } = {}
): Array<GroundedRewrite & { index: number }> {
    const results = bullets.map((bullet, index) => {
        const result = applyGroundedRewrite(bullet, options);
        const cleanedBullet = result.rewritten;

        const structureNotes: string[] = [];

        // Check for action verb at start
        const startsWithVerb = /^(built|developed|created|designed|implemented|led|managed|achieved|reduced|improved|optimized|drafted|conducted|proposed|translated|analyzed|launched|delivered|deployed|configured|trained|mentored|researched|collaborated|established|generated|streamlined|automated|integrated)/i.test(cleanedBullet);
        if (!startsWithVerb) {
            structureNotes.push('Add action verb at start');
        }

        // Check for outcome/result
        const hasOutcome = /\b(result|impact|led to|enabling|resulting|allowing|helping|increas|decreas|reduc|improv|achiev|generat|sav|deliver)\b/i.test(cleanedBullet);
        const hasMetric = /\d+%|\d+\+|\$[\d]|[\d]+x\b/i.test(cleanedBullet);
        if (!hasOutcome && !hasMetric) {
            structureNotes.push('Add measurable outcome or result');
        }

        // Check for tool/technology specificity
        const hasTool = /\b(using|via|with|through|by|on|in)\s+[A-Z]/i.test(cleanedBullet);
        if (!hasTool) {
            structureNotes.push('Specify tool or technology used');
        }

        // Add structure notes to transformations
        result.transformations.push(...structureNotes);

        return { ...result, index };
    });

    return results.filter(r =>
        r.rewritten !== r.original ||   // text was changed
        r.transformations.length > 0 || // has structural notes
        r.violations.length > 0         // has validation issues
    );
}

/**
 * Extract verifiable metrics from text
 * Only returns metrics that are explicitly stated
 */
export function extractVerifiableMetrics(text: string): {
    percentages: string[];
    money: string[];
    counts: string[];
    multipliers: string[];
} {
    const percentages = (text.match(/\d+(?:\.\d+)?%/g) || []);
    const money = (text.match(/\$[\d,]+(?:K|M|B)?/g) || []);
    const counts = (text.match(/\d+K?\+?\s*(?:users|customers|downloads|requests)/gi) || []);
    const multipliers = (text.match(/\d+x/gi) || []);

    return {
        percentages,
        money,
        counts,
        multipliers,
    };
}

/**
 * Determine if metrics are present (for conditional rewrites)
 */
function hasQuantifiedMetrics(text: string): boolean {
    const metrics = extractVerifiableMetrics(text);
    return (
        metrics.percentages.length > 0 ||
        metrics.money.length > 0 ||
        metrics.counts.length > 0 ||
        metrics.multipliers.length > 0
    );
}

/**
 * Generate structure-only improvements when metrics are absent
 */
function generateStructureImprovements(text: string): string[] {
    const suggestions: string[] = [];

    // Check if starts with action verb
    const startsWithVerb = /^(built|developed|created|designed|implemented|led|managed|achieved|reduced|improved|optimized)/i.test(text);
    if (!startsWithVerb) {
        suggestions.push('Start bullet point with a strong action verb');
    }

    // Check for passive voice
    if (/\bwas\s+\w+ed\b/.test(text)) {
        suggestions.push('Convert from passive to active voice');
    }

    // Check for vague terms
    const vagueTerms = ['various', 'multiple', 'several', 'some', 'many'];
    vagueTerms.forEach(term => {
        if (new RegExp(`\\b${term}\\b`, 'i').test(text)) {
            suggestions.push(`Replace "${term}" with specific numbers or examples`);
        }
    });

    return suggestions;
}
