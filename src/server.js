require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const sanitizeRequest = require('./middlewares/sanitize')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const logger = require('./utils/logger')
const routes = require('./routes')
const prisma = require('./config/prisma')
const redis = require('./config/redis')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middlewares/errorHandlers')

const app = express()

app.use(express.json())
app.use(compression())
app.use(morgan('dev'))
app.use(cookieParser())

// 🛡️ Segurança
app.use(helmet())

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)

  app.use((req, res, next) => {
    if (req.secure) {
      return next()
    }
    res.redirect(`https://${req.headers.host}${req.url}`)
  })
}

// Força a utilização de conexões HTTPS
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  })
)

// CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://trusted.cdn.com'],
      // Outras diretivas conforme a necessidade
    },
  })
)

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://coin-wise.vercel.app'
        : 'http://localhost:5173',
    credentials: true,
  })
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
})

app.use(limiter)

// Middleware de sanitização
app.use(sanitizeRequest)

app.use('/api', routes)

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  next()
})

app.use(errorHandler)

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
