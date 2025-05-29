const redis = require('../config/redisClient');

async function deleteKeysByPattern(pattern) {
    const keys = [];
    for await (const key of redis.scanIterator({
        MATCH: pattern,
        COUNT: 100
    })) {
        keys.push(key);
    }
    if (keys.length > 0) {
        await redis.del(...keys);
        console.log('Post invalidated, welcome fresh data!');
    }
}

module.exports = deleteKeysByPattern;