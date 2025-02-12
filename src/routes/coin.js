const router = require('express').Router()
const coinController = require('../controllers/coin.controller')
const { authenticateToken } = require('../controllers/auth.controller')
const cacheMiddleware = require('../middlewares/cache')
const invalidateCache = require('../middlewares/invalidateCache')

router.post(
  '/coins',
  authenticateToken,
  invalidateCache(),
  coinController.create
)
router.get('/coins', cacheMiddleware(3600), coinController.findAll)
router.get(
  '/coins/search',
  cacheMiddleware(1800),
  coinController.findByNameOrSymbol
)
router.get(
  '/coins/:id',
  cacheMiddleware(1000),
  authenticateToken,
  coinController.findById
)
router.put(
  '/coins/:id',
  authenticateToken,
  invalidateCache(),
  coinController.update
)
router.delete(
  '/coins/:id',
  authenticateToken,
  invalidateCache(),
  coinController.delete
)

module.exports = router
