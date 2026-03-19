/**
 * Performance Benchmark Module
 * Tracks granular orchestrator execution timings.
 */

export interface BenchmarkMetrics {
    mean: number;
    p95: number;
    max: number;
    min: number;
    samples: number;
}

export class PerformanceBenchmark {
    private tracks: Map<string, number[]> = new Map();

    startMarker(label: string) {
        performance.mark(`${label}-start`);
    }

    endMarker(label: string) {
        performance.mark(`${label}-end`);
        try {
            performance.measure(label, `${label}-start`, `${label}-end`);
            const entries = performance.getEntriesByName(label);
            const latest = entries[entries.length - 1].duration;

            if (!this.tracks.has(label)) {
                this.tracks.set(label, []);
            }
            this.tracks.get(label)!.push(latest);

            // Cleanup
            performance.clearMarks(`${label}-start`);
            performance.clearMarks(`${label}-end`);
            performance.clearMeasures(label);
        } catch (e) {
            // Ignore browsers not supporting full performance specs
        }
    }

    /**
     * Compute sliding window metrics for a specific track
     */
    getMetrics(label: string): BenchmarkMetrics | null {
        const timings = this.tracks.get(label);
        if (!timings || timings.length === 0) return null;

        const sorted = [...timings].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, val) => acc + val, 0);

        const mean = sum / sorted.length;
        const p95Idx = Math.max(0, Math.floor(sorted.length * 0.95) - 1);
        const p95 = sorted[p95Idx];

        return {
            mean: Number(mean.toFixed(2)),
            p95: Number(p95.toFixed(2)),
            max: Number(sorted[sorted.length - 1].toFixed(2)),
            min: Number(sorted[0].toFixed(2)),
            samples: sorted.length
        };
    }

    getAllMetrics(): Record<string, BenchmarkMetrics> {
        const result: Record<string, BenchmarkMetrics> = {};
        for (const key of this.tracks.keys()) {
            const metrics = this.getMetrics(key);
            if (metrics) result[key] = metrics;
        }
        return result;
    }

    clear() {
        this.tracks.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }
}

export const globalBenchmark = new PerformanceBenchmark();
