/**
 * Resume Section Detector
 * Uses NLP and pattern matching to detect resume sections
 */

export interface DetectedSection {
    name: string;
    content: string;
    startIndex: number;
    endIndex: number;
    confidence: number; // 0-100
    detectionMethod: 'heading' | 'regex' | 'semantic';
}

export interface SectionDetectionResult {
    sections: { [sectionName: string]: DetectedSection };
    detectedSectionNames: string[];
    completenessScore: number;
    warnings: string[];
}

// Common section headers and their variations
const SECTION_PATTERNS = {
    name: {
        keywords: ['name', 'full name'],
        regex: /^[\s]*([A-Z][a-z]+\s+){1,3}[A-Z][a-z]+[\s]*$/m,
        priority: 1,
    },
    contact: {
        keywords: ['contact', 'contact information', 'phone', 'email', 'address'],
        regex: /(email|phone|mobile|linkedin|github|portfolio)[\s:]+/gi,
        priority: 2,
    },
    summary: {
        keywords: [
            'summary',
            'professional summary',
            'profile',
            'about',
            'about me',
            'objective',
            'career objective',
            'professional profile',
        ],
        regex: /^[\s]*(professional\s+)?(summary|profile|objective|about(\s+me)?)/im,
        priority: 3,
    },
    skills: {
        keywords: [
            'skills',
            'technical skills',
            'core competencies',
            'expertise',
            'technologies',
            'proficiencies',
        ],
        regex: /^[\s]*(technical\s+)?(skills|competencies|expertise|proficiencies)/im,
        priority: 4,
    },
    experience: {
        keywords: [
            'experience',
            'work experience',
            'employment',
            'professional experience',
            'work history',
            'career history',
        ],
        regex: /^[\s]*(work|professional|employment)\s*(experience|history)/im,
        priority: 5,
    },
    education: {
        keywords: ['education', 'academic background', 'qualifications', 'degrees'],
        regex: /^[\s]*education(al\s+background)?/im,
        priority: 6,
    },
    projects: {
        keywords: ['projects', 'portfolio', 'key projects', 'personal projects'],
        regex: /^[\s]*(key\s+|personal\s+|academic\s+)?projects/im,
        priority: 7,
    },
    certifications: {
        keywords: [
            'certifications',
            'certificates',
            'professional certifications',
            'licenses',
        ],
        regex: /^[\s]*(professional\s+)?(certifications?|licenses)/im,
        priority: 8,
    },
    awards: {
        keywords: ['awards', 'honors', 'achievements', 'recognition'],
        regex: /^[\s]*(awards|honors|achievements|recognition)/im,
        priority: 9,
    },
    volunteer: {
        keywords: ['volunteer', 'volunteering', 'community service'],
        regex: /^[\s]*(volunteer(ing)?|community\s+service)/im,
        priority: 10,
    },
};

/**
 * Detect section headings using regex and common patterns
 */
function detectSectionHeadings(text: string): Array<{ name: string; index: number; confidence: number }> {
    const headings: Array<{ name: string; index: number; confidence: number }> = [];
    const lines = text.split('\n');
    let currentIndex = 0;

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Check each section pattern
        Object.entries(SECTION_PATTERNS).forEach(([sectionName, pattern]) => {
            // Check regex match
            if (pattern.regex && pattern.regex.test(trimmedLine)) {
                headings.push({
                    name: sectionName,
                    index: currentIndex,
                    confidence: 90,
                });
            } else {
                // Check keyword match
                const lowerLine = trimmedLine.toLowerCase();
                pattern.keywords.forEach((keyword) => {
                    if (lowerLine === keyword || lowerLine === keyword + ':') {
                        headings.push({
                            name: sectionName,
                            index: currentIndex,
                            confidence: 80,
                        });
                    }
                });
            }
        });

        currentIndex += line.length + 1; // +1 for newline
    });

    return headings;
}

/**
 * Extract content between section headings
 */
function extractSectionContent(
    text: string,
    headings: Array<{ name: string; index: number; confidence: number }>
): { [sectionName: string]: DetectedSection } {
    const sections: { [sectionName: string]: DetectedSection } = {};

    // Sort headings by index
    const sortedHeadings = [...headings].sort((a, b) => a.index - b.index);

    sortedHeadings.forEach((heading, idx) => {
        const startIndex = heading.index;
        const endIndex = idx < sortedHeadings.length - 1
            ? sortedHeadings[idx + 1].index
            : text.length;

        const content = text.substring(startIndex, endIndex).trim();

        // Only add if not already exists or has higher confidence
        if (!sections[heading.name] || sections[heading.name].confidence < heading.confidence) {
            sections[heading.name] = {
                name: heading.name,
                content,
                startIndex,
                endIndex,
                confidence: heading.confidence,
                detectionMethod: 'heading',
            };
        }
    });

    return sections;
}

/**
 * Try to extract name from the beginning of the resume
 */
function extractName(text: string): DetectedSection | null {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    if (lines.length === 0) return null;

    // First line is often the name
    const firstLine = lines[0].trim();

    // Name heuristics:
    // - 2-5 words
    // - Title case
    // - No special characters (except spaces)
    // - Length 5-50 characters
    const words = firstLine.split(/\s+/);
    const isLikelyName =
        words.length >= 2 &&
        words.length <= 5 &&
        /^[A-Z]/.test(firstLine) &&
        !/[^\w\s.]/.test(firstLine) &&
        firstLine.length >= 5 &&
        firstLine.length <= 50;

    if (isLikelyName) {
        return {
            name: 'name',
            content: firstLine,
            startIndex: 0,
            endIndex: firstLine.length,
            confidence: 75,
            detectionMethod: 'semantic',
        };
    }

    return null;
}

/**
 * Main section detection function
 */
export function detectResumeSections(resumeText: string): SectionDetectionResult {
    const warnings: string[] = [];
    const sections: { [sectionName: string]: DetectedSection } = {};

    // Detect section headings
    const headings = detectSectionHeadings(resumeText);

    if (headings.length === 0) {
        warnings.push('No clear section headings detected. Resume may have formatting issues.');
    }

    // Extract content for each section
    const detectedSections = extractSectionContent(resumeText, headings);
    Object.assign(sections, detectedSections);

    // Try to extract name if not detected
    if (!sections.name) {
        const nameSection = extractName(resumeText);
        if (nameSection) {
            sections.name = nameSection;
        } else {
            warnings.push('Could not detect candidate name.');
        }
    }

    // Calculate completeness score
    const essentialSections = ['summary', 'skills', 'experience', 'education'];
    const optionalSections = ['projects', 'certifications', 'awards'];

    const essentialFound = essentialSections.filter((s) => sections[s]).length;
    const optionalFound = optionalSections.filter((s) => sections[s]).length;

    const completenessScore = Math.round(
        (essentialFound / essentialSections.length) * 70 +
        (optionalFound / optionalSections.length) * 30
    );

    // Add warnings for missing essential sections
    essentialSections.forEach((section) => {
        if (!sections[section]) {
            warnings.push(`Missing essential section: ${section}`);
        }
    });

    return {
        sections,
        detectedSectionNames: Object.keys(sections),
        completenessScore,
        warnings,
    };
}

/**
 * Get section by name (case-insensitive)
 */
export function getSection(
    detectionResult: SectionDetectionResult,
    sectionName: string
): DetectedSection | null {
    const normalized = sectionName.toLowerCase();
    return detectionResult.sections[normalized] || null;
}

/**
 * Check if resume has all essential sections
 */
export function hasEssentialSections(detectionResult: SectionDetectionResult): boolean {
    const essentialSections = ['summary', 'skills', 'experience', 'education'];
    return essentialSections.every((section) => detectionResult.sections[section]);
}
