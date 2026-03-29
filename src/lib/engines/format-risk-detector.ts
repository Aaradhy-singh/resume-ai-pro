/**
 * Format Risk Detector
 * 
 * Analyzes resume formatting for ATS parsing reliability,
 * detecting multi-column layouts, tables, graphics, and other
 * elements that may confuse ATS systems.
 */

export interface FormatRiskAssessment {
    parsingReliabilityScore: number; // 0-100, higher is better
    risks: FormatRisk[];
    hasMultiColumn: boolean;
    hasTables: boolean;
    hasGraphics: boolean;
    recommendation: string;
}

export interface FormatRisk {
    severity: "high" | "medium" | "low";
    issue: string;
    impact: string;
    suggestion: string;
}

/**
 * Detect multi-column layout (heuristic: unusual spacing patterns)
 */
export function detectMultiColumnLayout(resumeText: string): boolean {
    const lines = resumeText.split("\n");
    let suspiciousLines = 0;

    lines.forEach((line) => {
        // High risk: 2 or more distinct columns separated by 4+ spaces
        const spaceClusters = line.match(/\S+[ \t]{4,}\S+/g);

        // High risk: Left justified content, huge gap, right justified content (classic date alignment is okay, but multiple words is risky)
        const twoColumnPattern = /^\s*.{10,}[ \t]{5,}.{5,}\s*$/;

        if (spaceClusters || twoColumnPattern.test(line)) {
            suspiciousLines++;
        }
    });

    // If >10% of lines show column-like spacing, flag it
    return suspiciousLines > lines.length * 0.1;
}

/**
 * Detect tables (look for table-like patterns, grid outlines, hidden tabs)
 */
export function detectTables(resumeText: string): boolean {
    const lines = resumeText.split("\n");
    let tableLines = 0;

    lines.forEach((line) => {
        // 1. Explicit borders: | Column | Column |
        const pipeBorders = (line.match(/\|/g) || []).length >= 2;

        // 2. Tab grids: Word \t Word \t Word
        const tabGrids = (line.match(/\t/g) || []).length >= 2;

        // 3. ASCII borders: +----+----+ or ========
        const asciiBorders = /^[\s\+]*[-=]{3,}[\s\+]*[-=]{3,}/.test(line);

        // 4. Hidden Grid: Three or more tab-separated columns (actual tab character)
        //    Intentionally excludes lines with only spaces to avoid flagging
        //    normal date-aligned resume content (e.g., "Engineer    Jan 2020").
        const hiddenGrid = (line.match(/\t/g) || []).length >= 2;

        if (pipeBorders || tabGrids || asciiBorders || hiddenGrid) {
            tableLines++;
        }
    });

    // Tables usually take multiple lines. If we see 3+ table-like lines, it's a table.
    // Or if >5% of the document looks like a table grid.
    return tableLines >= 3 || tableLines > lines.length * 0.05;
}

/**
 * Detect graphics/icons (look for unicode symbols or image placeholders)
 */
export function detectGraphicsIcons(resumeText: string): boolean {
    // Heuristic: High density of unicode symbols (emoji, icons)
    const unicodeSymbolPattern = /[\u2600-\u26FF\u2700-\u27BF\u{1F300}-\u{1F9FF}]/gu;
    const matches = resumeText.match(unicodeSymbolPattern);

    if (matches && matches.length > 5) {
        return true;
    }

    // Check for image placeholder text
    if (resumeText.includes("[image]") || resumeText.includes("[icon]")) {
        return true;
    }

    return false;
}

/**
 * Compute overall parsing reliability score
 */
export function computeParsingReliability(resumeText: string): FormatRiskAssessment {
    const hasMultiColumn = detectMultiColumnLayout(resumeText);
    const hasTables = detectTables(resumeText);
    const hasGraphics = detectGraphicsIcons(resumeText);

    const risks: FormatRisk[] = [];
    let score = 100;

    if (hasMultiColumn) {
        score -= 40;
        risks.push({
            severity: "high",
            issue: "Multi-column layout detected",
            impact: "ATS may jumble content from different columns together",
            suggestion: "Convert to single-column layout with clear section breaks",
        });
    }

    if (hasTables) {
        score -= 30;
        risks.push({
            severity: "high",
            issue: "Tables detected in resume",
            impact: "ATS may fail to extract content from table cells correctly",
            suggestion: "Replace tables with plain text using bullet points and headers",
        });
    }

    if (hasGraphics) {
        score -= 20;
        risks.push({
            severity: "medium",
            issue: "Graphics or icons detected",
            impact: "ATS cannot parse images; content may be lost",
            suggestion: "Remove icons and replace with text descriptions",
        });
    }

    // Additional checks
    const lineCount = resumeText.split("\n").length;
    if (lineCount < 20) {
        score -= 10;
        risks.push({
            severity: "low",
            issue: "Resume appears very short",
            impact: "May lack necessary detail for ATS keyword matching",
            suggestion: "Ensure all key sections are present and detailed",
        });
    }

    score = Math.max(0, score);

    let recommendation = "Good formatting";
    if (score < 50) {
        recommendation = "High risk - significant reformatting needed";
    } else if (score < 75) {
        recommendation = "Moderate risk - some formatting adjustments recommended";
    } else if (score < 90) {
        recommendation = "Low risk - minor improvements possible";
    }

    return {
        parsingReliabilityScore: score,
        risks,
        hasMultiColumn,
        hasTables,
        hasGraphics,
        recommendation,
    };
}

export const detectFormatRisks = computeParsingReliability;
