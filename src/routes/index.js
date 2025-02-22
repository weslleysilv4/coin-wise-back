const router = require('express').Router()
const authRouter = require('./auth')
const coinRouter = require('./coin')

router.use('/auth', authRouter)
router.use('/', coinRouter)

module.exports = router
