const redis = require('../config/redisClient');

async function deleteKeysByPattern(pattern) {
    try {
        const keys = [];

        for await (const key of redis.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            keys.push(key);
        }

        if (keys.length === 0) {
            console.log('No cache keys matched. Nothing to invalidate.');
            return;
        }

        await redis.del(...keys);
        console.log(`✅ Cache invalidated: Deleted ${keys.length} key(s) for pattern "${pattern}"`);
    } catch (err) {
        console.error(`❌ Error invalidating cache for pattern "${pattern}":`, err);
    }
}

module.exports = deleteKeysByPattern;