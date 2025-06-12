const redis = require('../config/redisClient');
const logger = require('./logger');

const getCache = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 60) => {
    await redis.setEx(key, ttl, JSON.stringify(value));
};

const getOrSetCache = async (key, cb, expirationInSeconds = 60) => {
    const cached = await redis.get(key);
    if (cached) {
        logger.success(`Data is invalidated! KEY: '${key}'`);
        return JSON.parse(cached);
    };

    const data = await cb();
    await redis.setEx(key, expirationInSeconds, JSON.stringify(data));
    return data;
};

module.exports = { getCache, setCache, getOrSetCache };