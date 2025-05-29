const redis = require('../config/redisClient');

const getCache = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 60) => {
    await redis.setEx(key, ttl, JSON.stringify(value));
};

module.exports = { getCache, setCache };