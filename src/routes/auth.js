const router = require('express').Router()
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)
router.post('/auth/refresh', authController.refreshToken)
router.post('/logout', authController.logout)

module.exports = router
