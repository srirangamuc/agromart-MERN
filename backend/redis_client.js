// redisClient.js
const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                console.error('Redis: Max retries reached, giving up.');
                return new Error('Redis connection failed');
            }
            console.log(`Redis: Retrying connection (${retries + 1}/5)...`);
            return Math.min(retries * 100, 3000); // Exponential backoff
        }
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('Redis Client Ready');
});

redisClient.on('end', () => {
    console.log('Redis Connection Closed');
});

// Connect to Redis
async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err.message);
    }
}

connectRedis();

module.exports = redisClient;