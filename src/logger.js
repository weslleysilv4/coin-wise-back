const winston = require('winston')
const { createLogger, transports, format } = winston

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`
    })
  ),
  transports: [
    new transports.Console(), // Exibe logs no terminal
    new transports.File({ filename: 'logs/security.log' }), // Salva logs em um arquivo
  ],
})

module.exports = logger
