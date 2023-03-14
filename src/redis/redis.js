const { Redis } = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;
const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
    console.log(`Connected to Redis at ${redis.options.host}:${redis.options.port}`);
});

redis.on('error', (error) => {
    console.error(`Error connecting to Redis: ${error.message}`);
});

module.exports = { redis };
