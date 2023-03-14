const { Redis } = require('ioredis');

const redis = new Redis(7168);

redis.on('connect', () => {
    console.log(`Connected to Redis at ${redis.options.host}:${redis.options.port}`);
});

redis.on('error', (error) => {
    console.error(`Error connecting to Redis: ${error.message}`);
});

module.exports = { redis };
