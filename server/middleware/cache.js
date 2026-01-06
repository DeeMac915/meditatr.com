/**
 * Simple in-memory cache middleware for API responses
 * For production, consider using Redis
 */

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (duration = CACHE_TTL) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        const key = `${req.originalUrl}:${req.user?.uid || "anonymous"}`;
        const cached = cache.get(key);

        if (cached && Date.now() < cached.expires) {
            // Set cache headers
            res.set("X-Cache", "HIT");
            return res.json(cached.data);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = function (data) {
            // Cache the response
            cache.set(key, {
                data,
                expires: Date.now() + duration,
            });

            // Clean up old cache entries periodically
            if (cache.size > 1000) {
                const now = Date.now();
                for (const [k, v] of cache.entries()) {
                    if (now >= v.expires) {
                        cache.delete(k);
                    }
                }
            }

            res.set("X-Cache", "MISS");
            return originalJson(data);
        };

        next();
    };
};

// Clear cache for specific user
const clearUserCache = (userId) => {
    for (const [key] of cache.entries()) {
        if (key.includes(userId)) {
            cache.delete(key);
        }
    }
};

// Clear all cache
const clearCache = () => {
    cache.clear();
};

export { cacheMiddleware, clearUserCache, clearCache };
