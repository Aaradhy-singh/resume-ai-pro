import type { ParsedSection } from "@/lib/types";

export const headingPatterns: Record<string, RegExp> = {
    "Professional Summary": /^(?:summary|objective|profile|about\s*me|professional\s*summary)/i,
    Skills: /^(?:skills|technologies|tech\s*stack|competencies|technical\s*skills)/i,
    "Work Experience": /^(?:experience|employment|work\s*history|professional\s*experience)/i,
    Education: /^(?:education|academic|degree|university|college)/i,
    Projects: /^(?:projects|portfolio|personal\s*projects|side\s*projects)/i,
    Certifications: /^(?:certifications|certificates|licenses|credentials)/i,
};

// Semantic inference patterns (no heading needed)
export const semanticPatterns: Record<string, { patterns: RegExp[]; minMatches: number }> = {
    "Work Experience": {
        patterns: [
            /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2}/i,
            /\d{4}\s*[-–—]\s*(?:\d{4}|present|current)/i,
            /(?:inc\.|llc|ltd|corp|company|technologies|solutions|pvt)/i,
            /(?:developed|managed|led|designed|implemented|architected|built|created|maintained)/i,
        ],
        minMatches: 2,
    },
    Skills: {
        patterns: [
            /(?:javascript|python|java|c\+\+|typescript|ruby|go|rust|php|swift|kotlin)/i,
            /(?:react|angular|vue|django|flask|spring|express|next\.?js)/i,
            /(?:aws|azure|gcp|docker|kubernetes|jenkins|terraform)/i,
            /(?:sql|mongodb|postgresql|redis|graphql|rest\s*api)/i,
        ],
        minMatches: 3,
    },
    Education: {
        patterns: [
            /(?:university|college|institute|school|academy)/i,
            /(?:bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|b\.?e\.|m\.?e\.)/i,
            /(?:computer\s*science|engineering|information\s*technology|mathematics)/i,
            /(?:gpa|cgpa|percentage|grade)/i,
        ],
        minMatches: 2,
    },
    Projects: {
        patterns: [
            /(?:github\.com|gitlab\.com|bitbucket)/i,
            /(?:built\s+a|created\s+a|developed\s+a|personal\s+project)/i,
            /(?:features?:?|tech\s*stack:?|tools?\s*used:?)/i,
        ],
        minMatches: 2,
    },
    "Professional Summary": {
        patterns: [
            /(?:passionate|motivated|experienced|skilled|dedicated)\s+(?:developer|engineer|professional)/i,
            /(?:seeking|looking\s+for|interested\s+in)\s+(?:a\s+)?(?:role|position|opportunity)/i,
            /(?:\d+\+?\s*years?\s*(?:of\s+)?experience)/i,
        ],
        minMatches: 1,
    },
    Certifications: {
        patterns: [
            /(?:certified|certification|certificate|credential)/i,
            /(?:aws\s+certified|google\s+certified|microsoft\s+certified|pmp|scrum\s+master)/i,
        ],
        minMatches: 1,
    },
};

export function parseResumeSections(text: string): ParsedSection[] {
    const sections: ParsedSection[] = [
        { name: "Professional Summary", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
        { name: "Skills", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
        { name: "Work Experience", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
        { name: "Education", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
        { name: "Projects", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
        { name: "Certifications", content: [], found: false, confidence: 0, detectionMethod: "not-detected" },
    ];

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // Phase 1: Heading-based detection
    let currentSection = "";
    for (const line of lines) {
        let matched = false;
        for (const [sectionName, pattern] of Object.entries(headingPatterns)) {
            if (pattern.test(line) && line.length < 60) {
                currentSection = sectionName;
                const section = sections.find((s) => s.name === sectionName);
                if (section) {
                    section.found = true;
                    section.confidence = 95;
                    section.detectionMethod = "heading";
                }
                matched = true;
                break;
            }
        }
        if (!matched && currentSection) {
            const section = sections.find((s) => s.name === currentSection);
            if (section && section.content.length < 5) {
                section.content.push(line);
            }
        }
    }

    // Phase 2: Semantic inference for sections not found by heading
    const fullText = text.toLowerCase();
    for (const [sectionName, config] of Object.entries(semanticPatterns)) {
        const section = sections.find((s) => s.name === sectionName);
        if (!section || section.found) continue;

        let matchCount = 0;
        const matchedPatterns: string[] = [];
        for (const pattern of config.patterns) {
            const matches = fullText.match(new RegExp(pattern.source, "gi"));
            if (matches && matches.length > 0) {
                matchCount++;
                matchedPatterns.push(matches[0]);
            }
        }

        if (matchCount >= config.minMatches) {
            section.found = true;
            section.detectionMethod = "semantic";
            section.confidence = Math.min(90, 50 + (matchCount / config.patterns.length) * 40);
            section.content = matchedPatterns.slice(0, 3).map(
                (m) => `Detected: "${m.substring(0, 60)}${m.length > 60 ? "..." : ""}"`
            );
        }
    }

    // Phase 3: Keyword heuristic fallback
    if (!sections.some((s) => s.found)) {
        const lower = text.toLowerCase();
        if (lower.includes("react") || lower.includes("javascript") || lower.includes("python")) {
            const s = sections.find((s) => s.name === "Skills")!;
            s.found = true;
            s.confidence = 40;
            s.detectionMethod = "keyword-heuristic";
            s.content = ["Technical skills detected via keyword scan"];
        }
        if (lower.includes("developed") || lower.includes("managed") || lower.includes("led")) {
            const s = sections.find((s) => s.name === "Work Experience")!;
            s.found = true;
            s.confidence = 35;
            s.detectionMethod = "keyword-heuristic";
            s.content = ["Work experience indicators detected"];
        }
        if (lines.length > 0) {
            const s = sections.find((s) => s.name === "Professional Summary")!;
            s.found = true;
            s.confidence = 30;
            s.detectionMethod = "keyword-heuristic";
            s.content = [lines[0].substring(0, 120)];
        }
    }

    return sections;
}
