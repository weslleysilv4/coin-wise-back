const router = require('express').Router()
const authenticateToken = require('../middlewares/authenticateToken')
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/logout', authenticateToken, authController.logout)

module.exports = router
