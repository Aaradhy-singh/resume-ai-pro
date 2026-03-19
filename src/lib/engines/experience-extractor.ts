/**
 * Experience Extractor
 * Parses resume text to extract employment history with date ranges
 */

import type { ExperienceEntry, DateRange } from '@/types/career-stage';

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
    const normalized = dateStr.trim().toLowerCase();

    // Handle "present", "current"
    if (normalized === 'present' || normalized === 'current' || normalized === 'now') {
        return new Date();
    }

    // Try various date formats
    const patterns = [
        /(\w+)\s+(\d{4})/i, // "Jan 2020", "January 2020"
        /(\d{1,2})\/(\d{4})/i, // "01/2020"
        /(\d{4})/i, // "2020"
    ];

    for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
            try {
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                    return parsed;
                }
            } catch {
                // Continue to next pattern
            }
        }
    }

    return null;
}

/**
 * Extract date range from text like "Jan 2020 - Dec 2022" or "2020 - Present"
 */
export function extractDateRange(text: string): DateRange {
    const rangePat = /(.+?)\s*[-–—]\s*(.+)/;
    const match = text.match(rangePat);

    if (!match) {
        return {
            start: null,
            end: null,
            isCurrent: false,
            durationMonths: null,
            confidence: 0,
        };
    }

    const startStr = match[1].trim();
    const endStr = match[2].trim();

    const start = parseDate(startStr);
    const end = parseDate(endStr);
    const isCurrent = /present|current|now/i.test(endStr);

    let durationMonths = null;
    if (start && end) {
        const diffMs = end.getTime() - start.getTime();
        durationMonths = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)));
    }

    const confidence = (start && end) ? 90 : (start || end) ? 50 : 0;

    return {
        start,
        end,
        isCurrent,
        durationMonths,
        confidence,
    };
}

/**
 * Extract all experience entries from resume text
 * Looks for employment, internships, and projects
 */
export function extractExperiences(resumeText: string): ExperienceEntry[] {
    const lines = resumeText.split('\n');
    const experiences: ExperienceEntry[] = [];

    // Employment/Internship patterns
    const titleOrgPattern = /^([A-Z][^\n]{10,80}?)\s+(?:at|@|-)\s+([A-Z][^\n]{2,50})$/m;

    // Date range patterns
    const dateRangePattern = /([A-Za-z]+\s+\d{4}|0?\d\/\d{4}|\d{4})\s*[-–—]\s*(Present|Current|[A-Za-z]+\s+\d{4}|0?\d\/\d{4}|\d{4})/i;

    // Internship keywords
    const internKeywords = /\b(intern|internship|co-op|coop|trainee|apprentice)\b/i;

    // Project indicators
    const projectKeywords = /\b(project|built|developed|created|designed)\b/i;

    let currentEntry: Partial<ExperienceEntry> | null = null;
    let currentDescription: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for title + organization pattern
        const titleMatch = line.match(titleOrgPattern);
        if (titleMatch) {
            // Save previous entry
            if (currentEntry && currentEntry.title) {
                experiences.push({
                    ...currentEntry as ExperienceEntry,
                    description: currentDescription.join(' '),
                });
            }

            const title = titleMatch[1].trim();
            const organization = titleMatch[2].trim();

            currentEntry = {
                title,
                organization,
                type: internKeywords.test(title) ? 'internship' : 'employment',
                dateRange: { start: null, end: null, isCurrent: false, durationMonths: null, confidence: 0 },
                description: '',
                technologies: [],
            };
            currentDescription = [];
            continue;
        }

        // Check for date range
        const dateMatch = line.match(dateRangePattern);
        if (dateMatch && currentEntry) {
            currentEntry.dateRange = extractDateRange(line);
            continue;
        }

        // Accumulate description
        if (currentEntry) {
            currentDescription.push(line);
        }
    }

    // Save last entry
    if (currentEntry && currentEntry.title) {
        experiences.push({
            ...currentEntry as ExperienceEntry,
            description: currentDescription.join(' '),
        });
    }

    return experiences;
}

/**
 * Calculate total years of experience from entries
 * Only counts employment and internships with valid dates
 */
export function calculateTotalExperience(experiences: ExperienceEntry[]): number | null {
    const validExperiences = experiences.filter(exp =>
        (exp.type === 'employment' || exp.type === 'internship') &&
        exp.dateRange.durationMonths !== null &&
        exp.dateRange.confidence >= 50
    );

    if (validExperiences.length === 0) {
        return null; // Cannot determine - NO GUESSING
    }

    const totalMonths = validExperiences.reduce((sum, exp) =>
        sum + (exp.dateRange.durationMonths || 0), 0
    );

    return totalMonths / 12;
}

/**
 * Extract graduation year from education section
 */
export function extractGraduationYear(resumeText: string): number | null {
    const gradPatterns = [
        /graduated?\s+(?:in\s+)?(\d{4})/i,
        /(?:expected|anticipated)\s+(?:graduation\s+)?(?:in\s+)?(\d{4})/i,
        /(?:bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech).*?(\d{4})/i,
    ];

    for (const pattern of gradPatterns) {
        const match = resumeText.match(pattern);
        if (match && match[1]) {
            const year = parseInt(match[1], 10);
            if (year >= 1980 && year <= new Date().getFullYear() + 5) {
                return year;
            }
        }
    }

    return null;
}

export function calculateExperience(text: string) {
    const experiences = extractExperiences(text);
    const totalYears = calculateTotalExperience(experiences);
    return {
        totalYears: totalYears ?? 0,
        experiences,
    };
}
