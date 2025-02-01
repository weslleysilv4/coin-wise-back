require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const logger = require('./logger') // Arquivo de logs com Winston
const routes = require('./routes') // Arquivo com as rotas da aplicação

const app = express()

// 🛡️ Segurança
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(compression())
app.use(morgan('dev'))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
})
app.use(limiter)

app.use('/api', routes)

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message} - Path: ${req.path}`)
  res.status(500).json({ message: 'Internal server error' })
})

// 🚀 Iniciando o servidor
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

module.exports = app
