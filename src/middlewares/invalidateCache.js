const redis = require('../config/redis')
const logger = require('../utils/logger')

const invalidateCache = () => {
  return async (req, res, next) => {
    const originalSend = res.send
    res.send = async function (...args) {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const keys = await redis.keys('cache:*coins*')
          if (keys.length > 0) {
            await redis.del(keys)
            logger.info('Cache invalidated for coins')
          }
        }
      } catch (error) {
        logger.error(`Cache invalidation error: ${error.message}`)
      }
      originalSend.apply(res, args)
    }
    next()
  }
}

module.exports = invalidateCache
