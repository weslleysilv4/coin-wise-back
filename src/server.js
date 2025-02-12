require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const logger = require('./logger')
const routes = require('./routes')
const prisma = require('./config/prisma')
const redis = require('./config/redis')
const cookieParser = require('cookie-parser')

const app = express()

// 🛡️ Segurança
app.use(helmet())
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://coin-wise.vercel.app'
        : 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(compression())
app.use(morgan('dev'))
app.use(cookieParser())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
})
app.use(limiter)

app.use('/api', routes)

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message} - Path: ${req.path}`)
  res.status(500).json({ message: 'Internal server error' })
})

// 🚀 Iniciando o servidor
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 8081, () => {
    console.log(
      `🚀 Server running on http://localhost:${process.env.PORT || 8081}`
    )
  })
}

process.on('SIGINT', async () => {
  await Promise.all([prisma.$disconnect(), redis.quit()])
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await Promise.all([prisma.$disconnect(), redis.quit()])
  process.exit(0)
})

module.exports = app
