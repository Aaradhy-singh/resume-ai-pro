/**
 * Skill Normalization Engine
 * 
 * Maps raw detected skills to canonical ontology entries,
 * handling synonyms, abbreviations, variants, and deduplication.
 */


/**
 * Custom Levenshtein Distance implementation to avoid 'natural' library
 * dependency issues in browser bundling.
 *
 * Optimization: accepts an optional `maxDistance` bound — returns early with
 * `maxDistance + 1` as soon as it is certain the true distance exceeds that
 * bound, avoiding unnecessary row computations.
 */
function levenshteinDistance(a: string, b: string, maxDistance?: number): number {
    // Quick length-difference short-circuit
    if (maxDistance !== undefined && Math.abs(a.length - b.length) > maxDistance) {
        return maxDistance + 1;
    }

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        let rowMin = Infinity;
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
            if (matrix[i][j] < rowMin) rowMin = matrix[i][j];
        }
        // If every cell in this row already exceeds the bound, prune early
        if (maxDistance !== undefined && rowMin > maxDistance) {
            return maxDistance + 1;
        }
    }

    return matrix[b.length][a.length];
}

import { buildVariantMap, getSkillCategory, getSkillSubcategory, type SkillCategory } from "./skill-ontology";

import { FUZZY_MATCH_MAX_DISTANCE, FUZZY_MATCH_MIN_LENGTH } from "../constants";

// ─── Module-level caches ──────────────────────────────────────────────────────

/**
 * Cached variant map — built once per module lifetime instead of on every call.
 * `buildVariantMap()` iterates the entire ontology (400+ entries) each time it
 * is invoked, so calling it 5× per resume analysis added measurable overhead.
 */
let _variantMapCache: Map<string, string> | null = null;
function getVariantMap(): Map<string, string> {
    if (!_variantMapCache) {
        _variantMapCache = buildVariantMap();
    }
    return _variantMapCache;
}

/**
 * Pre-compiled per-variant regex patterns — avoids recompiling the same regex
 * on every call to `extractRawSkills`.
 * Each entry is [compiledPattern, variantString].
 */
let _variantPatternsCache: Array<[RegExp, string]> | null = null;
function getVariantPatterns(): Array<[RegExp, string]> {
    if (!_variantPatternsCache) {
        _variantPatternsCache = Array.from(getVariantMap().keys()).map(
            (variant) => [
                new RegExp(`\\b${escapeRegExpStatic(variant)}\\b`, 'gi'),
                variant,
            ]
        );
    }
    return _variantPatternsCache;
}

/** Module-level tech-term pattern (no need to recompile on every call). */
const TECH_PATTERN = /\b([A-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*(?:\.js|\.py|\.io)?)\b/g;

/** Common English words to exclude from tech-term detection. */
const COMMON_WORDS = new Set([
    'The', 'This', 'That', 'With', 'From', 'Using', 'And', 'For', 'Are',
    'Was', 'Has', 'Have', 'Not', 'But', 'You', 'All', 'Can', 'Her', 'One',
    'Our', 'Out', 'Day', 'Get', 'Him', 'His', 'How', 'Its', 'May', 'New',
    'Now', 'Old', 'See', 'Two', 'Way', 'Who', 'Did', 'Let',
]);

/** Escape regex special characters — static version used at module init time. */
function escapeRegExpStatic(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
 * Extract raw skill keywords from text using ontology-based matching.
 *
 * Optimizations applied:
 *  - Variant map is read from the module-level cache (`getVariantMap`) instead
 *    of being rebuilt on every call.
 *  - Per-variant regex patterns are pre-compiled once (`getVariantPatterns`) so
 *    they are not recompiled on every invocation.
 *  - Detection loop uses `push` instead of spread (`[...acc, variant]`) to
 *    avoid creating a new array on every match (O(n²) → O(n)).
 *  - Tech-term pattern is a module-level constant (`TECH_PATTERN`).
 *  - Common-word exclusion list is a module-level `Set` (`COMMON_WORDS`) for
 *    O(1) lookup.
 */
export function extractRawSkills(text: string): string[] {
    const lowercaseText = text.toLowerCase();

    // Use cached pre-compiled patterns — avoids per-call regex compilation
    const variantPatterns = getVariantPatterns();
    const detected: string[] = [];
    for (const [pattern, variant] of variantPatterns) {
        // Reset lastIndex since patterns have the `g` flag
        pattern.lastIndex = 0;
        if (pattern.test(lowercaseText)) {
            detected.push(variant);
        }
    }

    const uniqueSkills = Array.from(new Set(detected));

    // Extract capitalized technology-looking terms not in ontology.
    // Re-use module-level compiled pattern (reset lastIndex for each call).
    TECH_PATTERN.lastIndex = 0;
    const techMatches = text.match(TECH_PATTERN) || [];
    const knownSkills = new Set(uniqueSkills.map(s => s.toLowerCase()));

    techMatches.forEach(term => {
        if (
            term.length >= 3 &&
            !knownSkills.has(term.toLowerCase()) &&
            !COMMON_WORDS.has(term)
        ) {
            uniqueSkills.push(term.toLowerCase());
        }
    });

    return Array.from(new Set(uniqueSkills));
}

/**
 * Normalize raw skills by mapping to canonical ontology entries.
 * Uses the cached variant map instead of rebuilding it on every call.
 */
export function normalizeSkills(rawSkills: string[]): NormalizedSkill[] {
    const variantMap = getVariantMap();
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
 * Deduplicate skills by removing synonyms that map to the same canonical.
 * Uses the cached variant map instead of rebuilding it on every call.
 */
function deduplicateSynonyms(skills: string[]): string[] {
    const variantMap = getVariantMap();
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
 * Expand abbreviations to full canonical names.
 * Uses the cached variant map instead of rebuilding it on every call.
 */
function expandAbbreviation(skill: string): string {
    const variantMap = getVariantMap();
    const canonical = variantMap.get(skill.toLowerCase());
    return canonical || skill;
}

/**
 * Complete skill extraction and normalization pipeline.
 *
 * Optimizations applied:
 *  - Uses the module-level cached variant map (`getVariantMap`) — no rebuild.
 *  - Levenshtein comparisons skip variants whose length difference already
 *    exceeds `FUZZY_MATCH_MAX_DISTANCE`, and use the early-exit overload of
 *    `levenshteinDistance` to prune mid-computation when possible.
 */
export function extractAndNormalizeSkills(text: string): SkillExtractionResult {
    // Extract raw skills
    const rawSkills = extractRawSkills(text);

    // Normalize to ontology
    const normalizedSkills = normalizeSkills(rawSkills);

    // Identity unknown skills using fuzzy matching
    const variantMap = getVariantMap();
    const unrecognizedTerms: string[] = [];

    // Convert map to array for fuzzy searching
    const variantEntries = Array.from(variantMap.entries());

    rawSkills.forEach((skill) => {
        const lowerSkill = skill.toLowerCase();
        if (variantMap.has(lowerSkill)) {
            // Already handled in normalizeSkills perfectly
            return;
        }

        // Fuzzy match using Levenshtein Distance.
        // Skip variants whose length difference already exceeds the threshold
        // to avoid unnecessary O(m*n) computations.
        let bestDistance = FUZZY_MATCH_MAX_DISTANCE + 1; // start above threshold
        let bestCanonical: string | null = null;
        let bestVariant: string | null = null;

        for (const [variant, canonical] of variantEntries) {
            // Length-difference prune (free O(1) check)
            if (Math.abs(lowerSkill.length - variant.length) > FUZZY_MATCH_MAX_DISTANCE) {
                continue;
            }
            const distance = levenshteinDistance(lowerSkill, variant, FUZZY_MATCH_MAX_DISTANCE);
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
            // Passthrough: treat unrecognized terms as their own canonical skill
            // This prevents penalizing skills that exist in both resume and JD
            // but are not yet in the ontology
            if (lowerSkill.length >= 3) {
                normalizedSkills.push({
                    canonical: skill,
                    rawVariants: [skill],
                    category: 'tool' as any,
                    confidence: 60,
                });
            }
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
