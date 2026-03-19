/**
 * Memory Profiler Hook
 * Tracks object sizes to detect memory leaks and residual growth across verification runs
 */

export class MemoryProfiler {
    private snapshots: Map<string, number[]> = new Map();

    /**
     * Record the length/size of an array or object
     */
    trackSize(key: string, data: any) {
        let size = 0;
        if (Array.isArray(data)) {
            size = data.length;
        } else if (typeof data === 'object' && data !== null) {
            size = Object.keys(data).length;
        } else if (typeof data === 'string') {
            size = data.length;
        }

        if (!this.snapshots.has(key)) {
            this.snapshots.set(key, []);
        }
        this.snapshots.get(key)!.push(size);
    }

    /**
     * Analyze tracked snapshots for monotonic residual growth (memory leak signal)
     */
    analyzeGrowth(runs: number): { hasLeak: boolean; leakyKeys: string[] } {
        const leakyKeys: string[] = [];

        for (const [key, sizes] of this.snapshots.entries()) {
            if (sizes.length < runs) continue;

            // Check if size strictly increases over the last 10 samples (indicating possible array push without clear)
            const recent = sizes.slice(-10);
            if (recent.length >= 2) {
                let strictlyIncreasing = true;
                for (let i = 1; i < recent.length; i++) {
                    if (recent[i] <= recent[i - 1]) {
                        strictlyIncreasing = false;
                        break;
                    }
                }
                if (strictlyIncreasing && recent[recent.length - 1] > recent[0]) {
                    leakyKeys.push(key);
                }
            }
        }

        return {
            hasLeak: leakyKeys.length > 0,
            leakyKeys
        };
    }

    clear() {
        this.snapshots.clear();
    }
}

export const globalMemoryProfiler = new MemoryProfiler();
