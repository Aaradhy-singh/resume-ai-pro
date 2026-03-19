/**
 * Ontology Expansion Engine
 * 
 * Converts static skill ontology into an extensible system.
 * Auto-detects unknown skills, suggests canonical mappings,
 * and provides an admin approval layer for ontology growth.
 */

import { skillOntology, type SkillEntry } from './skill-ontology';
import { FUZZY_MATCH_THRESHOLD } from '../constants';

export interface UnknownSkillDetection {
    rawTerm: string;
    context: string;            // Surrounding text snippet
    suggestedCanonical: string | null;
    similarity: number;         // 0-1 confidence in suggestion
    suggestedCategory: string | null;
}

export interface PendingSkillEntry {
    id: string;
    rawTerm: string;
    suggestedCanonical: string;
    suggestedCategory: string;
    detectedAt: string;         // ISO timestamp
    status: 'pending' | 'approved' | 'rejected';
    context: string;
}

export interface OntologyExpansionResult {
    knownSkills: string[];
    unrecognizedTerms: UnknownSkillDetection[];
    pendingCount: number;
    expansionSuggestions: string[];
}

/**
 * In-memory store for pending skills awaiting admin approval.
 * In production, this would be backed by a database.
 */
const pendingSkillStore: PendingSkillEntry[] = [];

/**
 * Runtime skill additions (approved entries)
 */
const runtimeSkills: SkillEntry[] = [];

/**
 * Common tech terms that are likely skills but might not be in the ontology
 */
const TECH_TERM_PATTERNS = [
    /\b[A-Z][a-z]+(?:\.js|\.py|\.ts|\.io)\b/g,           // CapitalCase.ext patterns (e.g. Bun.js)
    /\b[A-Z][a-zA-Z]+(?:DB|ML|AI|UI|UX|API|SDK|CI|CD)\b/g, // Acronym-suffixed (e.g. DynamoDB)
    /\b(?:lib|framework|platform|tool|engine|kit)\s+(\w+)\b/gi, // "framework X"
];

/**
 * Compute simple string similarity (Dice coefficient)
 */
function diceCoefficient(a: string, b: string): number {
    const aBigrams = new Set<string>();
    const bBigrams = new Set<string>();
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    for (let i = 0; i < aLower.length - 1; i++) {
        aBigrams.add(aLower.substring(i, i + 2));
    }
    for (let i = 0; i < bLower.length - 1; i++) {
        bBigrams.add(bLower.substring(i, i + 2));
    }

    let intersection = 0;
    aBigrams.forEach(bigram => {
        if (bBigrams.has(bigram)) intersection++;
    });

    return (2 * intersection) / (aBigrams.size + bBigrams.size) || 0;
}

/**
 * Find closest canonical match for an unknown term
 */
function findClosestCanonical(term: string): {
    canonical: string | null;
    similarity: number;
    category: string | null;
} {
    let bestMatch = { canonical: null as string | null, similarity: 0, category: null as string | null };

    const allSkills = [...skillOntology.skills, ...runtimeSkills];

    for (const entry of allSkills) {
        // Check canonical name
        const canonicalSim = diceCoefficient(term, entry.canonical);
        if (canonicalSim > bestMatch.similarity) {
            bestMatch = { canonical: entry.canonical, similarity: canonicalSim, category: entry.category };
        }

        // Check variants
        for (const variant of entry.variants) {
            const variantSim = diceCoefficient(term, variant);
            if (variantSim > bestMatch.similarity) {
                bestMatch = { canonical: entry.canonical, similarity: variantSim, category: entry.category };
            }
        }
    }

    // Only suggest if similarity > threshold
    if (bestMatch.similarity < FUZZY_MATCH_THRESHOLD) {
        return { canonical: null, similarity: bestMatch.similarity, category: null };
    }

    return bestMatch;
}

/**
 * Build a set of all known skill terms (canonical + variants) for fast lookup
 */
function buildKnownTermSet(): Set<string> {
    const known = new Set<string>();
    const allSkills = [...skillOntology.skills, ...runtimeSkills];

    for (const entry of allSkills) {
        known.add(entry.canonical.toLowerCase());
        entry.variants.forEach(v => known.add(v.toLowerCase()));
    }

    return known;
}

/**
 * Extract potential tech terms from text that are not in the ontology
 */
export function detectUnknownSkills(text: string): UnknownSkillDetection[] {
    const knownTerms = buildKnownTermSet();
    const unknowns: UnknownSkillDetection[] = [];
    const seenTerms = new Set<string>();

    // Match capitalized tech-like words (2+ chars, not common English)
    const commonEnglish = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
        'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has',
        'project', 'team', 'work', 'build', 'create', 'develop', 'manage',
        'experience', 'skills', 'education', 'company', 'position', 'role',
        'design', 'improve', 'analyze', 'implement', 'maintain', 'support',
        'lead', 'assist', 'ensure', 'provide', 'develop', 'manage',
        'january', 'february', 'march', 'april', 'may', 'june', 'july',
        'august', 'september', 'october', 'november', 'december', 'present',
        'university', 'college', 'school', 'bachelor', 'master', 'degree',
        'summary', 'objective', 'internship', 'employment', 'certification',
    ]);

    // Use tech-term patterns to find candidates
    for (const pattern of TECH_TERM_PATTERNS) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            const normalized = match.trim().toLowerCase();
            if (
                !knownTerms.has(normalized) &&
                !commonEnglish.has(normalized) &&
                !seenTerms.has(normalized) &&
                normalized.length >= 2
            ) {
                seenTerms.add(normalized);

                // Get surrounding context
                const idx = text.toLowerCase().indexOf(normalized);
                const contextStart = Math.max(0, idx - 40);
                const contextEnd = Math.min(text.length, idx + normalized.length + 40);
                const context = text.substring(contextStart, contextEnd).trim();

                const closest = findClosestCanonical(match);

                unknowns.push({
                    rawTerm: match,
                    context,
                    suggestedCanonical: closest.canonical,
                    similarity: Math.round(closest.similarity * 100) / 100,
                    suggestedCategory: closest.category,
                });
            }
        }
    }

    return unknowns;
}

/**
 * Add a pending skill entry for admin review
 */
function suggestCanonicalMapping(
    rawTerm: string,
    context: string,
    suggestedCanonical?: string,
    suggestedCategory?: string
): PendingSkillEntry {
    const closest = findClosestCanonical(rawTerm);

    const entry: PendingSkillEntry = {
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        rawTerm,
        suggestedCanonical: suggestedCanonical || closest.canonical || rawTerm,
        suggestedCategory: suggestedCategory || closest.category || 'unknown',
        detectedAt: new Date().toISOString(),
        status: 'pending',
        context,
    };

    pendingSkillStore.push(entry);
    return entry;
}

/**
 * Approve a pending skill and add it to the runtime ontology
 */
function approveSkill(pendingId: string): boolean {
    const entry = pendingSkillStore.find(e => e.id === pendingId);
    if (!entry || entry.status !== 'pending') return false;

    entry.status = 'approved';

    // Add to runtime ontology
    runtimeSkills.push({
        canonical: entry.suggestedCanonical,
        category: entry.suggestedCategory as import('./skill-ontology').SkillCategory,
        variants: [entry.rawTerm],
    });

    return true;
}

/**
 * Reject a pending skill
 */
function rejectSkill(pendingId: string): boolean {
    const entry = pendingSkillStore.find(e => e.id === pendingId);
    if (!entry || entry.status !== 'pending') return false;

    entry.status = 'rejected';
    return true;
}

/**
 * Get all pending skills
 */
function getPendingSkills(): PendingSkillEntry[] {
    return pendingSkillStore.filter(e => e.status === 'pending');
}

/**
 * Get runtime-added skills
 */
function getRuntimeSkills(): SkillEntry[] {
    return [...runtimeSkills];
}

/**
 * Full ontology expansion analysis
 */
function analyzeOntologyExpansion(text: string): OntologyExpansionResult {
    const knownTerms = buildKnownTermSet();
    const unknowns = detectUnknownSkills(text);

    // Extract known skills found in text
    const knownSkills: string[] = [];
    for (const entry of [...skillOntology.skills, ...runtimeSkills]) {
        const allTerms = [entry.canonical, ...entry.variants];
        for (const term of allTerms) {
            if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) {
                if (!knownSkills.includes(entry.canonical)) {
                    knownSkills.push(entry.canonical);
                }
                break;
            }
        }
    }

    const expansionSuggestions = unknowns
        .filter(u => u.suggestedCanonical !== null)
        .map(u => `"${u.rawTerm}" → "${u.suggestedCanonical}" (${Math.round(u.similarity * 100)}% confidence)`);

    return {
        knownSkills,
        unrecognizedTerms: unknowns,
        pendingCount: pendingSkillStore.filter(e => e.status === 'pending').length,
        expansionSuggestions,
    };
}
