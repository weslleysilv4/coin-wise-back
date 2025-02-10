const redis = require('../config/redis')
const logger = require('../logger')

const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`

    try {
      const cachedResponse = await redis.get(key)

      if (cachedResponse) {
        logger.info(`Cache hit: ${key}`)
        return res.json(JSON.parse(cachedResponse))
      }

      res.originalJson = res.json
      res.json = (body) => {
        redis.setex(key, duration, JSON.stringify(body))
        return res.originalJson(body)
      }

      next()
    } catch (error) {
      logger.error(`Cache error: ${error.message}`)
      next()
    }
  }
}

module.exports = cacheMiddleware
