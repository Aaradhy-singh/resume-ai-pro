/**
 * Job Description Parser
 * 
 * Cleans job descriptions by removing noise (stop words, HR boilerplate,
 * filler text) and extracting skill-specific keywords using NLP techniques.
 */

export interface CleanedJobDescription {
    originalText: string;
    cleanedText: string;
    extractedSkillKeywords: string[];
    removedBoilerplate: string[];
    noiseReduction: number; // Percentage of text removed
}

/**
 * Common stop words to remove
 */
const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "the", "this", "but", "they", "have",
    "had", "what", "when", "where", "who", "which", "why", "how",
]);

/**
 * HR boilerplate patterns to detect and remove
 */
const HR_BOILERPLATE_PATTERNS = [
    /we are an equal opportunity employer/gi,
    /we do not discriminate/gi,
    /all qualified applicants will receive consideration/gi,
    /please submit your resume/gi,
    /we offer competitive salary and benefits/gi,
    /join our team/gi,
    /be part of our mission/gi,
    /fast-paced environment/gi,
    /dynamic team/gi,
    /wear many hats/gi,
    /hit the ground running/gi,
    /self-starter/gi,
    /team player/gi,
    /work hard play hard/gi,
    /rockstar developer/gi,
    /ninja programmer/gi,
];

/**
 * Generic responsibility filler phrases
 */
const FILLER_RESPONSIBILITIES = [
    /excellent communication skills/gi,
    /strong interpersonal skills/gi,
    /ability to work independently/gi,
    /attention to detail/gi,
    /problem-solving skills/gi,
    /time management/gi,
    /organizational skills/gi,
    /multitasking ability/gi,
];

/**
 * Remove stop words from text
 */
export function removeStopWords(text: string): string {
    const words = text.toLowerCase().split(/\s+/);
    const filtered = words.filter((word) => !STOP_WORDS.has(word));
    return filtered.join(" ");
}

/**
 * Detect and remove HR boilerplate
 */
export function removeHRBoilerplate(text: string): { cleaned: string; removed: string[] } {
    let cleaned = text;
    const removed: string[] = [];

    HR_BOILERPLATE_PATTERNS.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
            removed.push(...matches);
            cleaned = cleaned.replace(pattern, "");
        }
    });

    return { cleaned, removed };
}

/**
 * Filter responsibility filler text
 */
export function filterFillerResponsibilities(text: string): string {
    let filtered = text;

    FILLER_RESPONSIBILITIES.forEach((pattern) => {
        filtered = filtered.replace(pattern, "");
    });

    return filtered;
}

/**
 * Extract skill-specific keywords using frequency thresholding
 * (Simple heuristic: words that appear in skill contexts and are capitalized or technical)
 */
export function extractSkillKeywords(text: string): string[] {
    // Pattern for likely skill keywords:
    // - Capitalized words (React, Python, AWS)
    // - Technical abbreviations (SQL, CI/CD, API)
    // - Version numbers (Python 3, Node.js)
    const skillPatterns = [
        /\b[A-Z][a-zA-Z]+(?:\.[a-z]+)?\b/g, // Capitalized: React, Node.js
        /\b[A-Z]{2,}\b/g,                     // Abbreviations: AWS, SQL, API
        /\b\w+\/\w+\b/g,                      // Slash notation: CI/CD
    ];

    const keywords = new Set<string>();

    skillPatterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach((match) => {
                // Filter out common non-skill words
                if (!["The", "We", "You", "Our", "This", "That"].includes(match)) {
                    keywords.add(match);
                }
            });
        }
    });

    return Array.from(keywords);
}

/**
 * Complete job description cleaning pipeline
 */
export function cleanJobDescription(jobDescriptionText: string): CleanedJobDescription {
    const originalLength = jobDescriptionText.length;

    // Step 1: Remove HR boilerplate
    const { cleaned: afterBoilerplate, removed: boilerplate } = removeHRBoilerplate(jobDescriptionText);

    // Step 2: Filter filler responsibilities
    const afterFiller = filterFillerResponsibilities(afterBoilerplate);

    // Step 3: Extract skill keywords before stop word removal
    const skillKeywords = extractSkillKeywords(afterFiller);

    // Step 4: Remove stop words for final cleaned text
    const cleanedText = removeStopWords(afterFiller);

    const cleanedLength = cleanedText.length;
    const noiseReduction = originalLength > 0
        ? Math.round(((originalLength - cleanedLength) / originalLength) * 100)
        : 0;

    return {
        originalText: jobDescriptionText,
        cleanedText,
        extractedSkillKeywords: skillKeywords,
        removedBoilerplate: boilerplate,
        noiseReduction,
    };
}
