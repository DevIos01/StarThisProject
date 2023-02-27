const { Redis } = require('ioredis');

const redis = Redis.createClient({
    url: 'redis://redis:6379'
});

redis.on('connect', () => {
    console.log(`Connected to Redis at ${redis.options.host}:${redis.options.port}`);
});

redis.on('error', (error) => {
    console.error(`Error connecting to Redis: ${error.message}`);
});

module.exports = { redis };