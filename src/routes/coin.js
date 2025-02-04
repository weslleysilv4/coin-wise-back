const router = require('express').Router()
const coinController = require('../controllers/coin.controller')
const { authenticateToken } = require('../controllers/auth.controller')

// Apply authentication middleware to all routes
router.use(authenticateToken)

// CRUD routes
router.post('/coins', coinController.create)
router.get('/coins', coinController.findAll)
router.get('/coins/:id', coinController.findById)
router.put('/coins/:id', coinController.update)
router.delete('/coins/:id', coinController.delete)

module.exports = router
