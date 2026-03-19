/**
 * Stable Sort Utility
 * Wraps array sorting with a secondary index-based tie-breaker
 * to ensure consistency across different browser engines.
 */
export function stableSort<T>(
    arr: T[],
    compareFn: (a: T, b: T) => number
): T[] {
    return arr
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            const order = compareFn(a.item, b.item);
            if (order !== 0) return order;
            return a.index - b.index; // Stability tie-breaker
        })
        .map(({ item }) => item);
}
