const router = require('express').Router()
const coinController = require('../controllers/coin.controller')
const { authenticateToken } = require('../controllers/auth.controller')

router.post('/coins', authenticateToken, coinController.create)
router.get('/coins', coinController.findAll)
router.get('/coins/search', coinController.findByNameOrSymbol)
router.get('/coins/:id', authenticateToken, coinController.findById)
router.put('/coins/:id', authenticateToken, coinController.update)
router.delete('/coins/:id', authenticateToken, coinController.delete)

module.exports = router
