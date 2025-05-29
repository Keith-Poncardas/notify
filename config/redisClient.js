const { createClient } = require('redis');
const logger = require('../utils/logger');

const client = createClient({
    username: 'default',
    password: '00x79GYiStko2Kb3iuubjzMb8Gj3QHFA',
    socket: {
        host: 'redis-10361.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
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