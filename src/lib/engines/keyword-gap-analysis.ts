/**
 * Keyword Gap Analysis Engine
 * Identifies missing skills/keywords based strictly on Job Description
 * HARDENED: Only generates gaps if JD is provided. No hallucinated gaps.
 */

import { extractAndNormalizeSkills } from './skill-normalizer';

export interface KeywordGap {
    keyword: string;
    category: 'critical' | 'important' | 'nice-to-have';
    frequency: number; // How many times it appears in JD
    context: string[]; // Sentences where it appears in JD
    missing: boolean;
    gapType: 'genuine-gap' | 'mention-gap' | 'unknown';
    // genuine-gap: skill not in resume AND not inferable from context
    // mention-gap: skill not explicitly listed but related skills ARE present
}

export interface GapAnalysisResult {
    totalGaps: number;
    criticalGaps: KeywordGap[];
    importantGaps: KeywordGap[];
    matchScore: number; // 0-100 based on weighted coverage
    safeToDisplay: boolean;
    genuineGaps: KeywordGap[];   // skill not in resume AND not inferable from context
    mentionGaps: KeywordGap[];   // skill not listed but related skills ARE present
}

/**
 * Analyze keyword gaps between Resume and JD
 */
export function analyzeKeywordGaps(
    resumeText: string,
    jdText: string | null
): GapAnalysisResult {
    if (!jdText || jdText.trim().length < 50) {
        return {
            totalGaps: 0,
            criticalGaps: [],
            importantGaps: [],
            matchScore: 0,
            safeToDisplay: false, // Don't show gaps if no JD
            genuineGaps: [],
            mentionGaps: [],
        };
    }

    // 1. Extract skills from both sources
    const resumeSkills = extractAndNormalizeSkills(resumeText);
    const jdSkills = extractAndNormalizeSkills(jdText);

    // 2. Compute frequency in JD (proxy for importance)
    const skillFrequency = new Map<string, number>();
    const skillContexts = new Map<string, string[]>();

    jdSkills.normalizedSkills.forEach(skill => {
        const canonical = skill.canonical.toLowerCase();
        skillFrequency.set(canonical, (skillFrequency.get(canonical) || 0) + 1);

        // Find context (simple sentence extraction)
        // In a real app, we'd use the source indices to extract sentences
        const regex = new RegExp(`[^.?!]*\\b${escapeRegExp(skill.canonical)}\\b[^.?!]*[.?!]`, 'gi');
        const matches = jdText.match(regex) || [];
        const existing = skillContexts.get(canonical) || [];
        skillContexts.set(canonical, [...existing, ...matches].slice(0, 3)); // Keep top 3 contexts
    });

    // 3. Identification of Missing Skills
    const resumeSkillSet = new Set(resumeSkills.normalizedSkills.map(s => s.canonical.toLowerCase()));
    const gaps: KeywordGap[] = [];
    let matchedWeight = 0;
    let totalWeight = 0;

    const STOPWORDS = new Set([
        'title', 'engineer', 'responsibilities', 'integrate', 'support', 'work',
        'team', 'experience', 'skills', 'role', 'job', 'position', 'company',
        'required', 'preferred', 'ability', 'knowledge', 'understanding', 'strong',
        'good', 'excellent', 'great', 'looking', 'candidate', 'must', 'will',
        'should', 'would', 'could', 'year', 'years', 'month', 'months', 'day',
        'days', 'time', 'working', 'help', 'build', 'develop', 'create', 'design',
        'implement', 'manage', 'lead', 'drive', 'ensure', 'provide', 'maintain',
        'improve', 'increase', 'reduce', 'deliver', 'review', 'write', 'test',
        'analyze', 'monitor', 'report', 'communicate', 'collaborate', 'coordinate',
        'minimum', 'maximum', 'plus', 'bonus', 'salary', 'benefits', 'location',
        'remote', 'hybrid', 'office', 'full', 'part', 'contract', 'permanent',
        'aaradhy', 'singh', 'phagwara', 'punjab', 'india', 'lovely', 
        'professional', 'university', 'objective', 'seeking', 'currently',
        'pursuing', 'computer', 'science', 'engineering', 'diploma',
        'bachelor', 'master', 'degree', 'student', 'fresher', 'intern',
        'internship', 'opportunities', 'environment', 'real',
        'apply', 'hands', 'independently', 'focused', 'building',
    ]);

    jdSkills.normalizedSkills.forEach(skill => {
        if (STOPWORDS.has(skill.canonical.toLowerCase())) return;
        if (skill.canonical.length < 3) return;

        const canonical = skill.canonical.toLowerCase();

        // Skip if we've already processed this canonical skill
        if (gaps.some(g => g.keyword.toLowerCase() === canonical)) return;

        const freq = skillFrequency.get(canonical) || 1;
        const isMissing = !resumeSkillSet.has(canonical);

        // Determine category based on frequency
        let category: 'critical' | 'important' | 'nice-to-have' = 'nice-to-have';
        if (freq >= 3) category = 'critical';
        else if (freq >= 2) category = 'important';

        const weight = category === 'critical' ? 3 : (category === 'important' ? 2 : 1);
        totalWeight += weight;
        if (!isMissing) matchedWeight += weight;

        if (isMissing) {
            const gapType = classifyGapType(
                skill.canonical,
                resumeText,
                resumeSkillSet
            );
            gaps.push({
                keyword: skill.canonical,
                category,
                frequency: freq,
                context: skillContexts.get(canonical) || [],
                missing: true,
                gapType,
            });
        }
    });

    // 4. Compute Weighted Match Score
    const matchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    return {
        totalGaps: gaps.length,
        criticalGaps: gaps.filter(g => g.category === 'critical').sort((a, b) => b.frequency - a.frequency),
        importantGaps: gaps.filter(g => g.category === 'important').sort((a, b) => b.frequency - a.frequency),
        matchScore,
        safeToDisplay: true,
        genuineGaps: gaps.filter(g => g.gapType === 'genuine-gap'),
        mentionGaps: gaps.filter(g => g.gapType === 'mention-gap'),
    };
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determine if a missing keyword is a genuine skill gap or 
 * just absent from the resume text despite likely being known.
 * 
 * A "mention gap" means: the person probably has this skill 
 * but didn't write it down.
 * A "genuine gap" means: nothing on their resume suggests 
 * they know this at all.
 */
function classifyGapType(
    missingKeyword: string,
    resumeText: string,
    resumeSkillSet: Set<string>
): 'genuine-gap' | 'mention-gap' | 'unknown' {
    const lower = missingKeyword.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    // Skill cluster relationships
    // If you have A, you probably know B (mention gap)
    const relatedClusters: Record<string, string[]> = {
        'docker': ['kubernetes', 'containers', 'containerization', 'devops', 'ci/cd'],
        'kubernetes': ['docker', 'helm', 'container orchestration', 'devops'],
        'python': ['pandas', 'numpy', 'jupyter', 'scikit-learn', 'tensorflow', 'pytorch', 'django', 'flask', 'fastapi'],
        'sql': ['postgresql', 'mysql', 'database', 'queries'],
        'react': ['javascript', 'typescript', 'frontend', 'node'],
        'node': ['javascript', 'express', 'backend', 'api'],
        'aws': ['cloud', 'ec2', 's3', 'lambda', 'cloud computing'],
        'azure': ['cloud', 'microsoft', 'cloud computing'],
        'gcp': ['cloud', 'google cloud', 'vertex ai', 'cloud computing'],
        'machine learning': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'data science'],
        'prompt engineering': ['generative ai', 'chatgpt', 'llm', 'openai'],
        'langchain': ['python', 'openai', 'llm', 'rag', 'prompt engineering'],
        'data analytics': ['excel', 'tableau', 'power bi', 'sql', 'google sheets', 'looker', 'business intelligence'],
        'ci/cd': ['github actions', 'jenkins', 'docker', 'devops'],
        'rest api': ['node', 'express', 'fastapi', 'backend', 'javascript'],
        'tensorflow': ['python', 'machine learning', 'neural networks', 'deep learning'],
        'pytorch': ['python', 'machine learning', 'neural networks', 'deep learning'],
    };

    const related = relatedClusters[lower] || [];

    // Check if any related skill exists in their resume
    const hasMentionEvidence = related.some(rel =>
        resumeSkillSet.has(rel.toLowerCase()) ||
        resumeLower.includes(rel.toLowerCase())
    );

    if (hasMentionEvidence) {
        return 'mention-gap';
    }

    // Check if the concept appears in resume even if not the exact word
    // e.g., "containerized" suggests Docker knowledge
    const conceptualVariants: Record<string, string[]> = {
        'docker': ['containeriz', 'container', 'dockerfile'],
        'kubernetes': ['k8s', 'orchestrat', 'cluster'],
        'ci/cd': ['pipeline', 'continuous integration', 'continuous deployment', 'automated deploy'],
        'rest api': ['restful', 'api endpoint', 'http request', 'api development'],
        'sql': ['database query', 'relational database', 'db query'],
        'prompt engineering': ['prompt design', 'prompt development', 'prompting'],
    };

    const variants = conceptualVariants[lower] || [];
    const hasConceptualEvidence = variants.some(v =>
        resumeLower.includes(v.toLowerCase())
    );

    if (hasConceptualEvidence) {
        return 'mention-gap';
    }

    // No evidence at all = genuine gap
    return 'genuine-gap';
}
