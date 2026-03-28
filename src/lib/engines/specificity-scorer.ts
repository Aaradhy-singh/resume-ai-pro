/**
 * Bullet Point Specificity Scorer
 * 
 * Scores each resume bullet on a 1-5 scale based on how 
 * defensible and specific the claim is.
 * 
 * Scale:
 * 1 - Vague: "Worked on AI projects"
 * 2 - Generic with number: "Improved performance by 40%" (no context)
 * 3 - Named technology: "Built a chatbot using OpenAI API"
 * 4 - Technology + outcome: "Built a RAG pipeline using LangChain 
 *     that reduced hallucination rate"
 * 5 - Technology + outcome + measurable baseline/delta: 
 *     "Reduced inference latency from 340ms to 200ms by switching 
 *     from cloud API to local Ollama deployment"
 */

export interface BulletScore {
    text: string;
    score: 1 | 2 | 3 | 4 | 5;
    label: 'vague' | 'generic' | 'named' | 'outcome-linked' | 'specific';
    reasons: string[];
    signals: {
        hasNamedTechnology: boolean;
        hasQuantifiedOutcome: boolean;
        hasBeforeAfterContext: boolean;
        hasCausalLanguage: boolean;
        hasVagueOpener: boolean;
    };
}

export interface SpecificityReport {
    bullets: BulletScore[];
    averageScore: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    weakBullets: BulletScore[];   // score <= 2
    strongBullets: BulletScore[]; // score >= 4
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
}

const NAMED_TECHNOLOGIES = [
    'react', 'angular', 'vue', 'python', 'java', 'node', 'express',
    'django', 'flask', 'mongodb', 'postgresql', 'mysql', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'typescript', 'javascript',
    'redis', 'graphql', 'firebase', 'tensorflow', 'pytorch', 'langchain',
    'openai', 'hugging face', 'vertex ai', 'ollama', 'llama', 'gemini',
    'claude', 'chatgpt', 'kafka', 'spark', 'hadoop', 'airflow', 'dbt',
    'tableau', 'power bi', 'pandas', 'numpy', 'scikit-learn', 'fastapi',
    'spring', 'next.js', 'tailwind', 'postgresql', 'supabase', 'prisma',
    'github actions', 'terraform', 'ansible', 'jenkins', 'prometheus',
    'grafana', 'elasticsearch', 'pinecone', 'chroma', 'weaviate',
    'embeddings', 'ibm watson', 'aws bedrock', 'sagemaker',
    'genai', 'genai tools', 'generative ai tools', 'ai-assisted',
    'no-code', 'llm', 'large language model', 'predictive modeling',
    'data analysis', 'cloud computing',
    // AI-specific terms mapped in the ontology
    'local inference', 'inference pipeline', 'system prompt',
    'prompt engineering', 'llm pipeline', 'rag pipeline',
    'vector store', 'fine-tuning', 'fine tuning', 'quantization',
    'retrieval augmented generation', 'local model', 'on-device llm',
    'chain of thought', 'few-shot', 'zero-shot', 'model inference',
    'token optimization', 'context window', 'prompt design',
    'prompt optimization', 'grounding', 'rag'
];

const VAGUE_OPENERS = [
    'worked on', 'helped with', 'assisted in', 'involved in',
    'participated in', 'contributed to', 'supported', 'was part of',
    'did some', 'handled', 'dealt with', 'was responsible for'
];

const CAUSAL_LANGUAGE = [
    'by ', 'using ', 'through ', 'via ', 'which ', 'resulting in',
    'enabling ', 'allowing ', 'to achieve', 'in order to',
    'by switching', 'by replacing', 'by implementing', 'by building',
    'by reducing', 'by automating'
];

const BEFORE_AFTER_PATTERNS = [
    /from\s+[\d.]+\s*(?:ms|s|%|hrs?|days?|kb|mb|gb)\s+to\s+[\d.]+/i,
    /reduced\s+.+\s+from\s+.+\s+to\s+/i,
    /improved\s+.+\s+from\s+.+\s+to\s+/i,
    /decreased\s+.+\s+from\s+.+\s+to\s+/i,
    /increased\s+.+\s+from\s+.+\s+to\s+/i,
    /cut\s+.+\s+from\s+.+\s+to\s+/i,
];

const QUANTIFIED_OUTCOME_PATTERNS = [
    /\d+%/,
    /\$[\d,]+[KMB]?/,
    /\d+x\s/i,
    /\d+(?:ms|s|hrs?|days?)\b/i,
    /\d+\+?\s*(?:users|clients|customers|requests|endpoints|services)/i,
    /\d+\s*(?:projects|templates|workflows|pipelines|models)/i,
    /\d{1,3}(?:,\d{3})+\+?/,        // matches 4,000+ or 10,000+
    /\b\d{3,}\+?\s*(?:particles|items|records|files|lines|queries|tasks|features|components|tests)/i,
];

export function scoreBullet(text: string): BulletScore {
    const lower = text.toLowerCase();
    const reasons: string[] = [];

    const hasNamedTechnology = NAMED_TECHNOLOGIES.some(tech =>
        lower.includes(tech.toLowerCase())
    );

    const hasQuantifiedOutcome = QUANTIFIED_OUTCOME_PATTERNS.some(p =>
        p.test(text)
    );

    const hasBeforeAfterContext = BEFORE_AFTER_PATTERNS.some(p =>
        p.test(text)
    );

    const hasCausalLanguage = CAUSAL_LANGUAGE.some(phrase =>
        lower.includes(phrase.toLowerCase())
    );

    const hasVagueOpener = VAGUE_OPENERS.some(opener =>
        lower.startsWith(opener.toLowerCase()) ||
        lower.includes(' ' + opener.toLowerCase())
    );

    const signals = {
        hasNamedTechnology,
        hasQuantifiedOutcome,
        hasBeforeAfterContext,
        hasCausalLanguage,
        hasVagueOpener,
    };

    // Score computation
    let score: 1 | 2 | 3 | 4 | 5 = 1;

    if (hasBeforeAfterContext && hasNamedTechnology) {
        score = 5;
        reasons.push('Before/after context with named technology — fully defensible');
    } else if (hasQuantifiedOutcome && hasCausalLanguage && hasNamedTechnology) {
        score = 5;
        reasons.push('Quantified outcome with causal explanation and named tool');
    } else if (hasQuantifiedOutcome && hasNamedTechnology) {
        score = 4;
        reasons.push('Named technology with measurable outcome');
        reasons.push('Add causal explanation (by doing X) to reach score 5');
    } else if (hasCausalLanguage && hasNamedTechnology) {
        score = 4;
        reasons.push('Named technology with causal language');
        reasons.push('Add a measurable outcome to reach score 5');
    } else if (hasNamedTechnology) {
        score = 3;
        reasons.push('Names a specific technology');
        reasons.push('Missing: measurable outcome or causal explanation');
    } else if (hasQuantifiedOutcome) {
        score = 2;
        reasons.push('Contains a number but lacks context');
        reasons.push('Without baseline or named tool, number is not defensible');
    } else {
        score = 1;
        reasons.push('No specific technology, no measurable outcome');
    }

    if (hasVagueOpener) {
        score = Math.max(1, score - 1) as 1 | 2 | 3 | 4 | 5;
        reasons.push('Vague opener detected — weakens the claim');
    }

    const labels: Record<1 | 2 | 3 | 4 | 5, BulletScore['label']> = {
        1: 'vague',
        2: 'generic',
        3: 'named',
        4: 'outcome-linked',
        5: 'specific',
    };

    return { text, score, label: labels[score], reasons, signals };
}

export function extractBullets(resumeText: string): string[] {
    const bullets: string[] = [];

    // Strategy 1: Split on newlines (works for DOCX and well-formatted PDFs)
    const bulletLineRegex = /^[\s]*[•\-\*◦▪→─]\s+(.+)$/;
    const pastTenseRegex = /^[A-Z][a-z]+ed[\s,].{10,}/;

    resumeText.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length < 20 || trimmed.length > 300) return;
        const match = trimmed.match(bulletLineRegex);
        if (match && match[1]) {
            bullets.push(match[1].trim());
        } else if (pastTenseRegex.test(trimmed)) {
            bullets.push(trimmed);
        }
    });

    // Strategy 2: Extract inline bullets from collapsed PDF text (• mid-string)
    const inlinePattern = /[•◦▪→]\s+([^•◦▪→\n]{20,300}?)(?=[•◦▪→]|$)/g;
    let match: RegExpExecArray | null;
    while ((match = inlinePattern.exec(resumeText)) !== null) {
        const text = match[1].trim();
        if (text.length >= 20 && text.length <= 300 && !bullets.includes(text)) {
            bullets.push(text);
        }
    }

    // Strategy 3: Lines starting with action verbs common in resumes
    const verbPattern = /(?:^|\n)\s*((?:Built|Designed|Developed|Implemented|Created|Led|Managed|Optimized|Deployed|Integrated|Architected|Automated|Reduced|Increased|Improved|Delivered|Launched|Established|Configured|Analyzed|Researched|Collaborated|Contributed)\s.{15,250})(?=\n|$)/gm;
    while ((match = verbPattern.exec(resumeText)) !== null) {
        const text = match[1].trim();
        if (!bullets.includes(text)) {
            bullets.push(text);
        }
    }

    const CERTIFICATION_FILTERS = [
        /credential\s*id/i,
        /credly\s*verified/i,
        /\(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec\s+20\d{2}\)$/i,
        /amazon\s*web\s*services\s*\(|google,\s*credly|ibm,\s*credly|forage\s*\(/i,
        /job\s*simulation\s*-\s*forage/i,
        /essentials\s*-\s*amazon/i,
        /course\s*-\s*hugging\s*face/i,
    ];

    const filtered = [...new Set(bullets)].filter(line => {
        const isCertLine = CERTIFICATION_FILTERS.some(p => p.test(line));
        return !isCertLine;
    });

    return filtered;
}

export function computeSpecificityReport(resumeText: string): SpecificityReport {
    const bullets = extractBullets(resumeText);

    if (bullets.length === 0) {
        return {
            bullets: [],
            averageScore: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            weakBullets: [],
            strongBullets: [],
            overallGrade: 'F',
            summary: 'No bullet points detected. Add bullet points to experience and project sections.',
        };
    }

    const scoredBullets = bullets.map(scoreBullet);
    const avgScore = Number(
        (scoredBullets.reduce((s, b) => s + b.score, 0) / scoredBullets.length).toFixed(1)
    );

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> =
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    scoredBullets.forEach(b => distribution[b.score]++);

    const weakBullets = scoredBullets.filter(b => b.score <= 2);
    const strongBullets = scoredBullets.filter(b => b.score >= 4);

    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (avgScore >= 4.5) overallGrade = 'A';
    else if (avgScore >= 3.5) overallGrade = 'B';
    else if (avgScore >= 2.5) overallGrade = 'C';
    else if (avgScore >= 1.5) overallGrade = 'D';
    else overallGrade = 'F'; // catches avgScore < 1.5

    const summary = `Average specificity: ${avgScore.toFixed(1)}/5 (Grade ${overallGrade}). ` +
        `${strongBullets.length} strong bullets, ${weakBullets.length} need improvement.`;

    return {
        bullets: scoredBullets,
        averageScore: Math.round(avgScore * 10) / 10,
        distribution,
        weakBullets,
        strongBullets,
        overallGrade,
        summary,
    };
}

export const scoreSpecificity = computeSpecificityReport;
