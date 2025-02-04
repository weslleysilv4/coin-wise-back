const router = require('express').Router()
const authRouter = require('./auth')
const coinRouter = require('./coin')

router.use('/', authRouter)
router.use('/', coinRouter)

module.exports = router
