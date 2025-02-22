const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const logger = require('../utils/logger')

/**
 * Middleware para autenticação via token JWT.
 *
 * Este middleware verifica se o cabeçalho "Authorization" contém um token JWT válido.
 * Caso o token seja válido, o usuário decodificado é atribuído a `req.user` e o fluxo continua.
 * Se não houver token ou se o token for inválido, encaminha um erro para o middleware de tratamento de erros.
 *
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função que invoca o próximo middleware.
 * @returns {void}
 */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return next(new ApiError('No token provided', 401, 'NO_TOKEN'))
  }

  const token = authHeader.split(' ')[1]
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user
    logger.info(`User ${user.id} authenticated successfully`)
    next()
  } catch (err) {
    logger.error(`Invalid token: ${err.message}`)
    return next(
      new ApiError(`Unauthorized: ${err.message}`, 401, 'INVALID_TOKEN')
    )
  }
}

module.exports = authenticateToken
