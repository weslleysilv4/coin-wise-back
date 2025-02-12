const Redis = require('ioredis')

const redisClient = new Redis(
  process.env.REDIS_URL || {
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  }
)

redisClient.on('error', (err) => console.error('Redis Client Error', err))
redisClient.on('connect', () => console.log('🔓 Redis Client Connected'))

module.exports = redisClient
