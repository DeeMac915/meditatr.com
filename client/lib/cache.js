/**
 * Simple client-side cache for API responses
 * Uses sessionStorage for persistence across page reloads
 */

const CACHE_PREFIX = "api_cache_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, params) => {
    const paramString = params ? JSON.stringify(params) : "";
    return `${CACHE_PREFIX}${url}${paramString}`;
};

export const getCachedResponse = (url, params) => {
    try {
        const key = getCacheKey(url, params);
        const cached = sessionStorage.getItem(key);
        
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid
        if (Date.now() - timestamp > CACHE_TTL) {
            sessionStorage.removeItem(key);
            return null;
        }
        
        return data;
    } catch (error) {
        console.warn("Cache read error:", error);
        return null;
    }
};

export const setCachedResponse = (url, params, data) => {
    try {
        const key = getCacheKey(url, params);
        const cacheData = {
            data,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        // Handle quota exceeded or other storage errors
        if (error.name === "QuotaExceededError") {
            // Clear old cache entries
            clearOldCache();
            try {
                const key = getCacheKey(url, params);
                sessionStorage.setItem(key, JSON.stringify({
                    data,
                    timestamp: Date.now(),
                }));
            } catch (retryError) {
                console.warn("Cache write error after cleanup:", retryError);
            }
        } else {
            console.warn("Cache write error:", error);
        }
    }
};

const clearOldCache = () => {
    try {
        const keys = Object.keys(sessionStorage);
        const now = Date.now();
        
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = JSON.parse(sessionStorage.getItem(key));
                    if (now - cached.timestamp > CACHE_TTL) {
                        sessionStorage.removeItem(key);
                    }
                } catch (e) {
                    // Remove invalid cache entries
                    sessionStorage.removeItem(key);
                }
            }
        });
    } catch (error) {
        console.warn("Cache cleanup error:", error);
    }
};

export const clearCache = () => {
    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn("Cache clear error:", error);
    }
};

// Clean up old cache on load
if (typeof window !== "undefined") {
    clearOldCache();
}

