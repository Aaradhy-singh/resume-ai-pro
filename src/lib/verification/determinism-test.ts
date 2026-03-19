import { analyzeResume, type AnalysisResult } from '../engines/analysis-orchestrator';
import { type ParsedResume } from '@/lib/parsers/resumeParser';
import { stableStringify } from '@/lib/utils/stable-json';
import { DeterministicPRNG } from './prng';

export interface DeterminismReport {
    passed: boolean;
    runs: number;
    hashes: string[];
    mismatchIndex?: number;
    diff?: string;
    metrics: {
        mean: number;
        stdDev: number;
        max: number;
        min: number;
    };
}

/**
 * Determinism Verification Harness
 * Runs the analysis pipeline multiple times with enforced determinism
 * and compares output hashes.
 */
export async function runDeterminismTest(
    parsedResume: ParsedResume,
    jobDescription?: string,
    iterations = 100
): Promise<DeterminismReport> {
    const hashes: string[] = [];
    const timings: number[] = [];
    let firstResultString = '';

    // Enforce system-wide determinism (Math.random, Date.now)
    DeterministicPRNG.enforceDeterminism();

    try {
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const result = await analyzeResume(parsedResume, jobDescription);
            const end = performance.now();
            timings.push(end - start);

            // Serialize with stable key ordering
            const serialized = stableStringify(result);

            // Basic hash (Web Crypto API for SHA-256)
            const msgBuffer = new TextEncoder().encode(serialized);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (i === 0) {
                firstResultString = serialized;
            } else if (hashHex !== hashes[0]) {
                // Restore before returning failure
                DeterministicPRNG.restoreStochasticity();
                return {
                    passed: false,
                    runs: i + 1,
                    hashes: [...hashes, hashHex],
                    mismatchIndex: i,
                    diff: `Mismatch at iteration ${i}. Hash: ${hashHex} vs ${hashes[0]}`,
                    metrics: calculateMetrics(timings)
                };
            }

            hashes.push(hashHex);
        }
    } finally {
        DeterministicPRNG.restoreStochasticity();
    }

    return {
        passed: true,
        runs: iterations,
        hashes,
        metrics: calculateMetrics(timings)
    };
}

function calculateMetrics(timings: number[]) {
    const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
    const stdDev = Math.sqrt(
        timings.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / timings.length
    );
    return {
        mean: Number(mean.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        max: Number(Math.max(...timings).toFixed(2)),
        min: Number(Math.min(...timings).toFixed(2))
    };
}
