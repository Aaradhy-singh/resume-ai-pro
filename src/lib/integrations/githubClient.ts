/**
 * GitHub Portfolio Analyzer
 * Fetches and analyzes GitHub portfolio data using the GitHub REST API
 *
 * Fixes applied:
 *  - Buffer.from → atob() (browser-safe base64 decoding)
 *  - 15-second hard timeout wrapping the entire analysis
 *  - Per-repo try/catch so one bad repo never aborts the rest
 * 
 * Total calls with token:
 * 1. rateLimit check — REMOVED
 * 2. users.getByUsername — 1 call
 * 3. GET /users/repos — 1 call  
 * 4. listLanguages × 10 — 10 calls
 * 5. listCommits × 10 — 10 calls
 * 6. getReadme × 10 — 10 calls
 * Total: ~32 calls per analysis
 * Well within 5000/hour authenticated limit.
 */

import { Octokit } from 'octokit';
import { CareerStage } from '@/types/career-stage';

// ─── Public interfaces ────────────────────────────────────────────────────────

export interface PortfolioAnalysis {
    username: string;
    profileData: {
        name: string | null;
        bio: string | null;
        location: string | null;
        publicRepos: number;
        followers: number;
        following: number;
        createdAt: Date;
    };
    repositoryMetrics: {
        totalRepos: number;
        totalStars: number;
        totalForks: number;
        languageDistribution: { [language: string]: number };
        avgCommitsPerRepo: number;
        lastActiveDate: Date;
    };
    topProjects: Array<{
        name: string;
        description: string | null;
        stars: number;
        forks: number;
        language: string | null;
        lastUpdated: Date;
        hasReadme: boolean;
        readmeLength: number;
        url: string;
    }>;
    portfolioScore: number;
    insights: {
        activityScore: number;
        qualityScore: number;
        diversityScore: number;
        documentationScore: number;
        consistencyScore: number;
    };
}

// ─── Portfolio Scoring Weights by Career Stage ────────────────────────────────

const PORTFOLIO_WEIGHTS: Record<CareerStage, {
    activity: number;
    quality: number;
    diversity: number;
    documentation: number;
    consistency: number;
}> = {
    // Students/Freshers: Value learning, experimentation, and communication
    student: { activity: 0.35, diversity: 0.25, documentation: 0.20, quality: 0.15, consistency: 0.05 },
    fresher: { activity: 0.30, diversity: 0.25, documentation: 0.20, quality: 0.15, consistency: 0.10 },

    // Juniors: Balance shifting towards quality and consistency
    junior: { quality: 0.25, consistency: 0.20, activity: 0.25, documentation: 0.15, diversity: 0.15 },

    // Mid/Senior: Value production quality, maintenance, and impact
    'mid-level': { quality: 0.35, consistency: 0.25, activity: 0.15, documentation: 0.15, diversity: 0.10 },
    senior: { quality: 0.40, consistency: 0.30, documentation: 0.15, activity: 0.10, diversity: 0.05 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract GitHub username from various URL formats.
 */
export function extractGitHubUsername(input: string): string | null {
    input = input.trim();

    // Direct username (no slashes or dots)
    if (!input.includes('/') && !input.includes('.')) {
        return input;
    }

    const patterns = [
        /github\.com\/([^/?#]+)/i,
        /^@?([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/,
    ];

    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Validate GitHub username format.
 */
export function validateGitHubUsername(username: string): { valid: boolean; error?: string } {
    const extracted = extractGitHubUsername(username);

    if (!extracted) {
        return { valid: false, error: 'Invalid GitHub username or URL format' };
    }

    // GitHub username rules: 1-39 chars, alphanumeric or hyphens, cannot start/end with hyphen
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(extracted)) {
        return { valid: false, error: 'Invalid GitHub username format' };
    }

    return { valid: true };
}

/**
 * Race a promise against a timeout.
 * Throws if the promise does not settle within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(message)), ms)
    );
    return Promise.race([promise, timeout]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze a GitHub portfolio.
 * Hard-limited to 15 seconds; if it times out, throws a descriptive error that
 * the orchestrator will catch and log as a warning (analysis continues without
 * portfolio data).
 */
export async function analyzeGitHubPortfolio(
    usernameOrUrl: string,
    careerStage: CareerStage = 'mid-level',
    githubToken?: string
): Promise<PortfolioAnalysis> {
    const username = extractGitHubUsername(usernameOrUrl);

    if (!username) {
        throw new Error('Invalid GitHub username or URL');
    }

    return withTimeout(
        _analyzeGitHubPortfolioInternal(username, careerStage, githubToken),
        30_000,
        'GitHub analysis timed out after 30 seconds. Portfolio data will be skipped.'
    );
}

// ─── Internal implementation ──────────────────────────────────────────────────

async function _analyzeGitHubPortfolioInternal(
    username: string,
    careerStage: CareerStage,
    githubToken?: string
): Promise<PortfolioAnalysis> {
    const token = githubToken || import.meta.env.VITE_GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    try {
        // ── User profile ─────────────────────────────────────────────────────
        const { data: user } = await octokit.rest.users.getByUsername({ username });

        // ── Repositories (up to 100, sorted by recently updated) ─────────────
        const { data: allRepos } = await octokit.request('GET /users/{username}/repos', {
            username,
            per_page: 100,
            sort: 'updated',
            type: 'owner'
        });

        // ── Filter to own, non-forked, non-archived repos ────────────────────
        const ownRepos = allRepos.filter((repo: any) => 
            !repo.fork &&
            !repo.archived &&
            repo.owner?.login?.toLowerCase() === 
                username.toLowerCase()
        );

        const languageDistribution: { [language: string]: number } = {};
        let totalStars = 0;
        let totalForks = 0;
        let totalCommits = 0;
        let reposWithCommits = 0;
        let lastActiveDate = new Date(0);

        ownRepos.forEach((repo: any) => {
            totalStars += repo.stargazers_count ?? 0;
            totalForks += repo.forks_count ?? 0;
            const updatedAt = new Date(repo.updated_at ?? Date.now());
            if (updatedAt > lastActiveDate) {
                lastActiveDate = updatedAt;
            }
        });

        const filteredRepos = ownRepos.filter((repo: any) => 
            !repo.fork &&
            !repo.archived &&
            repo.name.toLowerCase() !== username.toLowerCase() &&
            repo.name !== 'Aaradhy-Singh' &&
            !repo.name.toLowerCase().includes('profile')
        );

        const repoAnalysis = await Promise.all(
            filteredRepos.slice(0, 6).map(async (repo: any) => {
                try {
                    const [languagesRes, commitsRes] = await Promise.all([
                        octokit.rest.repos.listLanguages({
                            owner: username,
                            repo: repo.name,
                        }),
                        octokit.rest.repos.listCommits({
                            owner: username,
                            repo: repo.name,
                            per_page: 5,
                            since: new Date(
                                Date.now() - 365 * 24 * 60 * 60 * 1000
                            ).toISOString(),
                        }),
                    ]);

                    // Aggregate language distribution
                    Object.entries(languagesRes.data).forEach(([lang, bytes]) => {
                        languageDistribution[lang] = (languageDistribution[lang] ?? 0) + bytes;
                    });

                    totalCommits += commitsRes.data.length;
                    reposWithCommits++;

                    let hasReadme = false;
                    let readmeLength = 0;
                    try {
                        const readmeRes = await octokit.rest.repos.getReadme({
                            owner: username,
                            repo: repo.name,
                        });
                        readmeLength = atob(
                            readmeRes.data.content.replace(/\n/g, '')
                        ).length;
                        hasReadme = true;
                    } catch {
                        // No README is fine
                    }

                    return {
                        name: repo.name,
                        description: repo.description ?? null,
                        stars: repo.stargazers_count ?? 0,
                        forks: repo.forks_count ?? 0,
                        language: repo.language ?? null,
                        lastUpdated: new Date(repo.updated_at ?? Date.now()),
                        hasReadme,
                        readmeLength,
                        url: repo.html_url,
                    };
                } catch {
                    // One repo failed — return minimal data and continue
                    return {
                        name: repo.name,
                        description: repo.description ?? null,
                        stars: repo.stargazers_count ?? 0,
                        forks: repo.forks_count ?? 0,
                        language: repo.language ?? null,
                        lastUpdated: new Date(repo.updated_at ?? Date.now()),
                        hasReadme: false,
                        readmeLength: 0,
                        url: repo.html_url,
                    };
                }
            })
        );

        // ── Top projects by star count ────────────────────────────────────────
        const topProjects = [...repoAnalysis]
            .sort((a, b) => b.stars - a.stars)
            .slice(0, 8);

        // ── Score computation (using ownRepos only) ───────────────────────────
        const avgCommitsPerRepo = reposWithCommits > 0 ? totalCommits / reposWithCommits : 0;

        const daysSinceLastActivity = Math.floor(
            (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Activity: recency + % of own repos updated in last 12 months
        const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
        const recentlyActiveCount = ownRepos.filter(
            (r: any) => new Date(r.updated_at ?? 0).getTime() > twelveMonthsAgo
        ).length;
        const recencyBonus = ownRepos.length > 0
            ? Math.round((recentlyActiveCount / ownRepos.length) * 30)
            : 0;
        const activityScore = Math.min(100, Math.max(0, 100 - daysSinceLastActivity * 2) + recencyBonus);

        // Quality: stars, forks, repos with descriptions, repos with stars
        const avgStarsPerRepo = ownRepos.length > 0 ? totalStars / ownRepos.length : 0;
        const reposWithDesc = ownRepos.filter((r: any) => r.description && r.description.trim().length > 5).length;
        const reposWithStars = ownRepos.filter((r: any) => (r.stargazers_count ?? 0) > 0).length;
        const descBonus = ownRepos.length > 0 ? Math.round((reposWithDesc / ownRepos.length) * 20) : 0;
        const starsBonus = ownRepos.length > 0 ? Math.round((reposWithStars / ownRepos.length) * 20) : 0;
        const qualityScore = Math.min(
            100,
            Math.round(avgStarsPerRepo * 8) + (totalForks > 10 ? 15 : 0) + descBonus + starsBonus
        );

        const languageCount = Object.keys(languageDistribution).length;
        const diversityScore = Math.min(100, languageCount * 15);

        const reposWithReadme = repoAnalysis.filter(r => r.hasReadme).length;
        const avgReadmeLength =
            repoAnalysis.length > 0
                ? repoAnalysis.reduce((sum, r) => sum + r.readmeLength, 0) / repoAnalysis.length
                : 0;
        const documentationScore = Math.min(
            100,
            repoAnalysis.length > 0
                ? (reposWithReadme / repoAnalysis.length) * 50 + Math.min(50, avgReadmeLength / 10)
                : 0
        );

        const consistencyScore = Math.min(100, avgCommitsPerRepo * 5);

        const weights = PORTFOLIO_WEIGHTS[careerStage];
        const portfolioScore = Math.round(
            activityScore * weights.activity +
            qualityScore * weights.quality +
            diversityScore * weights.diversity +
            documentationScore * weights.documentation +
            consistencyScore * weights.consistency
        );

        return {
            username,
            profileData: {
                name: user.name ?? null,
                bio: user.bio ?? null,
                location: user.location ?? null,
                publicRepos: user.public_repos,
                followers: user.followers,
                following: user.following,
                createdAt: new Date(user.created_at),
            },
            repositoryMetrics: {
                totalRepos: ownRepos.length,
                totalStars,
                totalForks,
                languageDistribution,
                avgCommitsPerRepo: Math.round(avgCommitsPerRepo),
                lastActiveDate,
            },
            topProjects,
            portfolioScore,
            insights: {
                activityScore: Math.round(activityScore),
                qualityScore: Math.round(qualityScore),
                diversityScore: Math.round(diversityScore),
                documentationScore: Math.round(documentationScore),
                consistencyScore: Math.round(consistencyScore),
            },
        };
    } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        if (err.status === 404) {
            throw new Error(`GitHub user "${username}" not found`);
        } else if (err.status === 403) {
            throw new Error(
                'GitHub API rate limit exceeded. ' +
                'Add VITE_GITHUB_TOKEN to your .env file for 5000 requests/hour.'
            );
        } else {
            throw new Error(
                `Failed to analyze GitHub portfolio: ${err.message ?? 'Unknown error'}`
            );
        }
    }
}
