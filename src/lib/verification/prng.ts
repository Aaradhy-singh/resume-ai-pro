/**
 * Seeded Pseudorandom Number Generator
 * Replaces Math.random() for deterministic runtime verification
 * 
 * Uses a simple Mulberry32 algorithm
 */

export class DeterministicPRNG {
    private seed: number;

    constructor(seed = 1337) {
        this.seed = seed;
    }

    /**
     * Set a new seed for the PRNG
     */
    setSeed(newSeed: number) {
        this.seed = newSeed;
    }

    /**
     * Returns a predictable random number between 0 and 1
     */
    random(): number {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /**
     * Monkey-patch the global Math.random and Date.now for rigorous determinism testing
     * CAUTION: Only run inside verification/test harnesses. 
     */
    static enforceDeterminism(timestamp = 1709400000000) {
        const prng = new DeterministicPRNG();
        if (!(window as any).__originalMathRandom) {
            (window as any).__originalMathRandom = Math.random;
        }
        if (!(window as any).__originalDateNow) {
            (window as any).__originalDateNow = Date.now;
        }

        Math.random = () => prng.random();
        Date.now = () => timestamp;
    }

    /**
     * Restore original system stochasticity
     */
    static restoreStochasticity() {
        if ((window as any).__originalMathRandom) {
            Math.random = (window as any).__originalMathRandom;
        }
        if ((window as any).__originalDateNow) {
            Date.now = (window as any).__originalDateNow;
        }
    }
}
