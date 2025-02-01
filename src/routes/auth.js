const router = require('express').Router()
const authController = require('../controllers/auth.controller')

router.post('/login', (req, res) => {
  return authController.login(req, res)
})

module.exports = router
