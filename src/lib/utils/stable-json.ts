/**
 * Deterministic JSON stringify
 * Ensures object keys are always sorted to prevent hash mismatches
 * due to property order nondeterminism.
 */
export function stableStringify(obj: any): string {
    const allKeys: string[] = [];
    JSON.stringify(obj, (key, value) => {
        allKeys.push(key);
        return value;
    });

    return JSON.stringify(obj, (_, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return Object.keys(value)
                .sort()
                .reduce((sorted: any, key) => {
                    sorted[key] = value[key];
                    return sorted;
                }, {});
        }
        return value;
    });
}
