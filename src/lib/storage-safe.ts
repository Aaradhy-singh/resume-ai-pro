/**
 * Safe Storage Wrapper
 * Guards against QuotaExceededError and SecurityError when accessing
 * browser storage APIs in incognito mode or tightly-constrained environments.
 */

export const safeStorage = {
    setItem: (key: string, value: string, isLocal = false): boolean => {
        try {
            const storage = isLocal ? window.localStorage : window.sessionStorage;
            storage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn(`[SafeStorage] Failed to set ${key} in ${isLocal ? 'localStorage' : 'sessionStorage'}:`, e);
            if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
                // Handle quota limit - potentially clear older data if we cared, but for now just prevent a hard crash
                // We'll return false so the caller knows it failed
            }
            return false;
        }
    },

    getItem: (key: string, isLocal = false): string | null => {
        try {
            const storage = isLocal ? window.localStorage : window.sessionStorage;
            return storage.getItem(key);
        } catch (e) {
            console.warn(`[SafeStorage] Failed to get ${key} from ${isLocal ? 'localStorage' : 'sessionStorage'}:`, e);
            return null;
        }
    },

    removeItem: (key: string, isLocal = false): void => {
        try {
            const storage = isLocal ? window.localStorage : window.sessionStorage;
            storage.removeItem(key);
        } catch (e) {
            console.warn(`[SafeStorage] Failed to remove ${key} from ${isLocal ? 'localStorage' : 'sessionStorage'}:`, e);
        }
    },

    clear: (isLocal = false): void => {
        try {
            const storage = isLocal ? window.localStorage : window.sessionStorage;
            storage.clear();
        } catch (e) {
            console.warn(`[SafeStorage] Failed to clear ${isLocal ? 'localStorage' : 'sessionStorage'}:`, e);
        }
    }
};
