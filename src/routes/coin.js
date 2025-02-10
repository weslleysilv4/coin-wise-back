const router = require('express').Router()
const coinController = require('../controllers/coin.controller')
const { authenticateToken } = require('../controllers/auth.controller')
const cacheMiddleware = require('../middlewares/cache')

router.post('/coins', authenticateToken, coinController.create)
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
router.put('/coins/:id', authenticateToken, coinController.update)
router.delete('/coins/:id', authenticateToken, coinController.delete)

module.exports = router
