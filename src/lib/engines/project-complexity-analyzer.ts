/**
 * Project Complexity Scoring Engine
 * 
 * Evaluates projects using 6 dimensions to produce a complexity score (0-100).
 * Prevents shallow GitHub repos from inflating readiness scores.
 * 
 * Feeds into: ATS scoring, Role matching, Portfolio strength
 */

export interface ProjectComplexityDimension {
    name: string;
    score: number;      // 0-100
    weight: number;     // Contribution %
    evidence: string[]; // What was detected
}

export interface ProjectComplexityResult {
    overallScore: number;           // 0-100 weighted
    dimensions: ProjectComplexityDimension[];
    projectCount: number;
    averageComplexity: number;      // Average per project
    complexityTier: 'trivial' | 'basic' | 'moderate' | 'substantial' | 'advanced';
    summary: string;
}

/**
 * Keywords used for each complexity dimension
 */
const DIMENSION_PATTERNS = {
    techStackBreadth: {
        languages: /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala|r|dart)\b/gi,
        frameworks: /\b(react|angular|vue|next\.?js|express|django|flask|spring|laravel|rails|svelte|gatsby)\b/gi,
    },
    backendPresence: {
        patterns: [
            /\b(server|backend|api|rest\s*api|graphql|endpoint|middleware|microservice|websocket)\b/gi,
            /\b(express|django|flask|spring\s*boot|fastapi|nest\.?js|koa|hapi)\b/gi,
            /\b(authentication|authorization|jwt|oauth|session|cors)\b/gi,
            /\b(ollama|gradio|streamlit|fastapi)\b/gi,
            /\b(local\s+llm|llm\s+deployment|inference\s+pipeline)\b/gi,
            /\b(tensorflow|pytorch|transformers|hugging\s*face)\b/gi,
            /\b(tensorflowjs|tensorflow\.js)\b/gi,
            /\b(three\.js|webgl|webml)\b/gi,
            /\b(system\s+prompt|context\s+memory|prompt\s+engineering)\b/gi,
        ],
    },
    deploymentEvidence: {
        patterns: [
            /\b(deploy|deployed|hosting|hosted|live|production|staging)\b/gi,
            /\b(ci\s*\/?\s*cd|github\s+actions|jenkins|vercel|netlify|heroku|aws|azure|gcp|docker)\b/gi,
            /\b(ssl|https|domain|dns|load\s+balancer|nginx|apache)\b/gi,
            /\b(github\.io|live\s+demo|deployed|aaradhy-singh\.github)\b/gi,
            /\b(offline|local\s+inference|no\s+cloud)\b/gi,
        ],
    },
    databaseUsage: {
        patterns: [
            /\b(database|db|sql|mysql|postgresql|postgres|mongodb|redis|elasticsearch|sqlite|dynamodb|cassandra|firebase|supabase)\b/gi,
            /\b(schema|migration|orm|prisma|sequelize|mongoose|typeorm|knex)\b/gi,
            /\b(crud|query|index|transaction|stored\s+procedure)\b/gi,
        ],
    },
    apiIntegrations: {
        patterns: [
            /\b(api|rest|graphql|webhook|endpoint|fetch|axios|http\s+client)\b/gi,
            /\b(third[\s-]party|integration|stripe|twilio|sendgrid|openai|mapbox|google\s+maps)\b/gi,
            /\b(oauth|api\s+key|rate\s+limit|pagination|polling|sse|socket)\b/gi,
        ],
    },
    documentationDepth: {
        patterns: [
            /\b(readme|documentation|docs|wiki|jsdoc|swagger|openapi|postman)\b/gi,
            /\b(getting\s+started|installation|setup\s+guide|contributing|changelog|license)\b/gi,
            /\b(architecture|design\s+doc|flowchart|diagram|comments)\b/gi,
            /\b(stack:|built\s+with|technologies:|tools:)\b/gi,
            /\b(objective|focused\s+on|designed\s+a)\b/gi,
        ],
    },
};

/**
 * Score a single complexity dimension.
 *
 * Optimization: evidence deduplication now uses a `Set` for O(1) membership
 * checks instead of `Array.includes()` (O(n)), which was called for every
 * regex match across multiple patterns.
 */
function scoreDimension(
    name: string,
    patterns: RegExp[],
    text: string,
    weight: number,
    maxEvidence: number = 6
): ProjectComplexityDimension {
    const evidenceSet = new Set<string>();

    patterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(m => {
            evidenceSet.add(m.trim().toLowerCase());
        });
    });

    const evidence = Array.from(evidenceSet);
    const uniqueCount = Math.min(evidence.length, maxEvidence);
    const score = Math.min(100, Math.round((uniqueCount / maxEvidence) * 100));

    return { name, score, weight, evidence: evidence.slice(0, 8) };
}

/**
 * Compute tech stack breadth score
 */
function scoreTechStackBreadth(text: string): ProjectComplexityDimension {
    const langMatches = new Set<string>();
    const fwMatches = new Set<string>();

    const langHits = text.match(DIMENSION_PATTERNS.techStackBreadth.languages) || [];
    langHits.forEach(m => langMatches.add(m.toLowerCase()));

    const fwHits = text.match(DIMENSION_PATTERNS.techStackBreadth.frameworks) || [];
    fwHits.forEach(m => fwMatches.add(m.toLowerCase()));

    const totalUnique = langMatches.size + fwMatches.size;
    const evidence = [...Array.from(langMatches), ...Array.from(fwMatches)];

    // 1-2 techs = basic, 3-5 = moderate, 6+ = advanced
    const score = Math.min(100, Math.round((totalUnique / 8) * 100));

    return {
        name: 'Tech Stack Breadth',
        score,
        weight: 20,
        evidence: evidence.slice(0, 10),
    };
}

/**
 * Determine complexity tier from overall score
 */
function getComplexityTier(score: number): 'trivial' | 'basic' | 'moderate' | 'substantial' | 'advanced' {
    if (score >= 75) return 'advanced';
    if (score >= 55) return 'substantial';
    if (score >= 35) return 'moderate';
    if (score >= 15) return 'basic';
    return 'trivial';
}

/**
 * Analyze project complexity from resume text and optional project sections
 * 
 * @param resumeText - Full resume text
 * @param projectSections - Optional array of individual project descriptions
 */
export function analyzeProjectComplexity(
    resumeText: string,
    projectSections?: string[]
): ProjectComplexityResult {
    // Use project sections if available, otherwise full resume
    const analysisText = projectSections && projectSections.length > 0
        ? projectSections.join('\n')
        : resumeText;

    const projectCount = projectSections?.length
        || Math.min((resumeText.match(/\bproject\b/gi) || []).length, 10);

    // Score each dimension
    const techStack = scoreTechStackBreadth(analysisText);

    const backend = scoreDimension(
        'Backend Presence',
        DIMENSION_PATTERNS.backendPresence.patterns,
        analysisText,
        20
    );

    const deployment = scoreDimension(
        'Deployment Evidence',
        DIMENSION_PATTERNS.deploymentEvidence.patterns,
        analysisText,
        15
    );

    const database = scoreDimension(
        'Database Usage',
        DIMENSION_PATTERNS.databaseUsage.patterns,
        analysisText,
        18
    );

    const api = scoreDimension(
        'API Integrations',
        DIMENSION_PATTERNS.apiIntegrations.patterns,
        analysisText,
        15
    );

    const documentation = scoreDimension(
        'Documentation Depth',
        DIMENSION_PATTERNS.documentationDepth.patterns,
        analysisText,
        12
    );

    const dimensions = [techStack, backend, deployment, database, api, documentation];

    // Weighted overall score
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const overallScore = Math.round(
        dimensions.reduce((sum, d) => sum + (d.score * d.weight), 0) / totalWeight
    );

    const averageComplexity = projectCount > 0
        ? Math.round(overallScore / Math.max(projectCount, 1))
        : overallScore;

    const complexityTier = getComplexityTier(overallScore);

    // Generate summary
    const strongDimensions = dimensions.filter(d => d.score >= 60).map(d => d.name);
    const weakDimensions = dimensions.filter(d => d.score < 25).map(d => d.name);

    let summary = `Project complexity: ${complexityTier} (${overallScore}/100).`;
    if (strongDimensions.length > 0) {
        summary += ` Strengths: ${strongDimensions.join(', ')}.`;
    }
    if (weakDimensions.length > 0) {
        summary += ` Gaps: ${weakDimensions.join(', ')}.`;
    }

    return {
        overallScore,
        dimensions,
        projectCount,
        averageComplexity,
        complexityTier,
        summary,
    };
}
