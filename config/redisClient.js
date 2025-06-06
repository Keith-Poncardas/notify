const { createClient } = require('redis');
const logger = require('../utils/logger');

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS || undefined,
    socket: {
        host: process.env.REDIS_HOST || undefined,
        port: 10361
    }
});

client.on('connect', () => {
    logger.success('Redis connected');
});

client.on('error', (err) => {
    logger.error('Redis error:', err);
});

async function clientInit() {
    await client.connect();
};

clientInit();

module.exports = client;