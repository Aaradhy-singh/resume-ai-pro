/**
 * Skill Normalization Engine
 * 
 * Maps raw detected skills to canonical ontology entries,
 * handling synonyms, abbreviations, variants, and deduplication.
 */


/**
 * Custom Levenshtein Distance implementation to avoid 'natural' library
 * dependency issues in browser bundling.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

import { buildVariantMap, getSkillCategory, getSkillSubcategory, type SkillCategory } from "./skill-ontology";

import { FUZZY_MATCH_MAX_DISTANCE, FUZZY_MATCH_MIN_LENGTH } from "../constants";

export interface NormalizedSkill {
    /** Canonical skill name from ontology */
    canonical: string;

    /** Original raw text that was normalized */
    rawVariants: string[];

    /** Skill category */
    category: SkillCategory;

    /** Optional subcategory */
    subcategory?: string;

    /** Confidence in this normalization (0-100) */
    confidence: number;
}

export interface SkillExtractionResult {
    /** Raw skills detected in text */
    rawSkills: string[];

    /** Normalized skills mapped to ontology */
    normalizedSkills: NormalizedSkill[];

    /** Skills that couldn't be normalized (unknown to ontology) */
    unrecognizedTerms: string[];
}

/**
 * Extract raw skill keywords from text using ontology-based matching
 */
export function extractRawSkills(text: string): string[] {
    const lowercaseText = text.toLowerCase();
    const variantMap = buildVariantMap();

    // Reduce over variant map keys to find all detected skills
    const detectedSkills = Array.from(variantMap.keys()).reduce<string[]>((acc, variant) => {
        const pattern = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'gi');
        return pattern.test(lowercaseText) ? [...acc, variant] : acc;
    }, []);

    return Array.from(new Set(detectedSkills));
}

/**
 * Normalize raw skills by mapping to canonical ontology entries
 */
export function normalizeSkills(rawSkills: string[]): NormalizedSkill[] {
    const variantMap = buildVariantMap();
    const normalizedMap = new Map<string, NormalizedSkill>();

    rawSkills.forEach((rawSkill) => {
        const canonical = variantMap.get(rawSkill.toLowerCase());

        if (canonical) {
            if (normalizedMap.has(canonical)) {
                // Add this variant to existing normalized skill
                const existing = normalizedMap.get(canonical)!;
                if (!existing.rawVariants.includes(rawSkill)) {
                    existing.rawVariants.push(rawSkill);
                }
            } else {
                // Create new normalized skill
                const category = getSkillCategory(canonical);
                const subcategory = getSkillSubcategory(canonical);

                if (category) {
                    normalizedMap.set(canonical, {
                        canonical,
                        rawVariants: [rawSkill],
                        category,
                        subcategory,
                        confidence: 100, // Exact ontology match
                    });
                }
            }
        }
    });

    return Array.from(normalizedMap.values());
}

/**
 * Deduplicate skills by removing synonyms that map to the same canonical
 */
function deduplicateSynonyms(skills: string[]): string[] {
    const variantMap = buildVariantMap();
    const canonicalSet = new Set<string>();

    skills.forEach((skill) => {
        const canonical = variantMap.get(skill.toLowerCase());
        if (canonical) {
            canonicalSet.add(canonical);
        } else {
            // Keep unknown skills as-is
            canonicalSet.add(skill);
        }
    });

    return Array.from(canonicalSet);
}

/**
 * Expand abbreviations to full canonical names
 */
function expandAbbreviation(skill: string): string {
    const variantMap = buildVariantMap();
    const canonical = variantMap.get(skill.toLowerCase());
    return canonical || skill;
}

/**
 * Complete skill extraction and normalization pipeline
 */
export function extractAndNormalizeSkills(text: string): SkillExtractionResult {
    // Extract raw skills
    const rawSkills = extractRawSkills(text);

    // Normalize to ontology
    const normalizedSkills = normalizeSkills(rawSkills);

    // Identity unknown skills using fuzzy matching
    const variantMap = buildVariantMap();
    const unrecognizedTerms: string[] = [];

    // Convert map to array for fuzzy searching
    const variantEntries = Array.from(variantMap.entries());

    rawSkills.forEach((skill) => {
        const lowerSkill = skill.toLowerCase();
        if (variantMap.has(lowerSkill)) {
            // Already handled in normalizeSkills perfectly
            return;
        }

        // Fuzzy match using Levenshtein Distance
        let bestDistance = Infinity;
        let bestCanonical: string | null = null;
        let bestVariant: string | null = null;

        for (const [variant, canonical] of variantEntries) {
            const distance = levenshteinDistance(lowerSkill, variant);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestCanonical = canonical;
                bestVariant = variant;
            }
        }

        // Threshold of 2 edit operations for near-misses (and make sure word isn't tiny)
        if (bestDistance <= FUZZY_MATCH_MAX_DISTANCE && lowerSkill.length > FUZZY_MATCH_MIN_LENGTH && bestCanonical && bestVariant) {
            // Check if we need to add to normalizedSkills
            const existing = normalizedSkills.find(s => s.canonical === bestCanonical);
            if (existing) {
                if (!existing.rawVariants.includes(skill)) {
                    existing.rawVariants.push(skill);
                }
            } else {
                const category = getSkillCategory(bestCanonical);
                const subcategory = getSkillSubcategory(bestCanonical);
                if (category) {
                    normalizedSkills.push({
                        canonical: bestCanonical,
                        rawVariants: [skill],
                        category,
                        subcategory,
                        confidence: 80, // Lower confidence for fuzzy match
                    });
                }
            }
        } else {
            unrecognizedTerms.push(skill);
        }
    });

    return {
        rawSkills,
        normalizedSkills,
        unrecognizedTerms,
    };
}

/**
 * Get skills grouped by category
 */
function groupSkillsByCategory(
    normalizedSkills: NormalizedSkill[]
): Map<SkillCategory, NormalizedSkill[]> {
    const grouped = new Map<SkillCategory, NormalizedSkill[]>();

    normalizedSkills.forEach((skill) => {
        const category = skill.category;
        if (!grouped.has(category)) {
            grouped.set(category, []);
        }
        grouped.get(category)!.push(skill);
    });

    return grouped;
}

/**
 * Helper to escape special regex characters
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compare two skill sets and identify matches/gaps
 */
export interface SkillComparisonResult {
    matched: NormalizedSkill[];
    onlyInFirst: NormalizedSkill[];
    onlyInSecond: NormalizedSkill[];
    matchPercentage: number;
}

function compareSkillSets(
    skillSet1: NormalizedSkill[],
    skillSet2: NormalizedSkill[]
): SkillComparisonResult {
    const canonicals1 = new Set(skillSet1.map((s) => s.canonical));
    const canonicals2 = new Set(skillSet2.map((s) => s.canonical));

    const matched = skillSet1.filter((s) => canonicals2.has(s.canonical));
    const onlyInFirst = skillSet1.filter((s) => !canonicals2.has(s.canonical));
    const onlyInSecond = skillSet2.filter((s) => !canonicals1.has(s.canonical));

    const totalUnique = new Set([...canonicals1, ...canonicals2]).size;
    const matchPercentage = totalUnique > 0
        ? Math.round((matched.length / totalUnique) * 100)
        : 0;

    return {
        matched,
        onlyInFirst,
        onlyInSecond,
        matchPercentage,
    };
}
