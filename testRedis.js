const client = require('./config/redisClient');

(async () => {
    await client.connect();
    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log(result);
})();