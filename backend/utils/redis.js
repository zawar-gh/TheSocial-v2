const Redis = require('ioredis');

let redisClient;

async function initRedis() {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL || undefined;
  redisClient = url ? new Redis(url) : new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  });
  await redisClient.ping();
  return redisClient;
}

function getRedis() {
  if (!redisClient) throw new Error('Redis not initialized. Call initRedis() first.');
  return redisClient;
}

module.exports = { initRedis, getRedis };


