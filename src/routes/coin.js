const router = require('express').Router()
const coinController = require('../controllers/coin.controller')
const authenticateToken = require('../middlewares/authenticateToken')
const cacheMiddleware = require('../middlewares/cache')
const invalidateCache = require('../middlewares/invalidateCache')
const coinIdSchema = require('../validations/coinId.validation')
const validateParams = require('../middlewares/validateParams')

router.post(
  '/coins',
  authenticateToken,
  invalidateCache(),
  coinController.create
)
router.get('/coins', cacheMiddleware(3600), coinController.findAll)

router.get(
  '/coins/:id',
  cacheMiddleware(1000),
  validateParams(coinIdSchema),
  authenticateToken,
  coinController.findById
)
router.put(
  '/coins/:id',
  authenticateToken,
  validateParams(coinIdSchema),
  invalidateCache(),
  coinController.update
)
router.delete(
  '/coins/:id',
  authenticateToken,
  validateParams(coinIdSchema),
  invalidateCache(),
  coinController.delete
)

module.exports = router
