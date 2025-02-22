const jwt = require('jsonwebtoken')
const AuthService = require('../services/auth.service')
const ApiError = require('../utils/ApiError')
const formatZodErrors = require('../utils/formatZodErrors')
const logger = require('../utils/logger')

class AuthController {
  /**
   * Realiza o login do usuário, definindo o refresh token em um cookie HTTP-only e retornando o access token.
   *
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware de tratamento.
   * @returns {Promise<void>}
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const { accessToken, refreshToken, user } = await AuthService.login(
        email,
        password
      )

      // Define o refresh token em cookie seguro e HTTP-only
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.json({
        success: true,
        message: 'Successfully logged in!',
        accessToken,
        user,
      })
    } catch (error) {
      if (error?.name === 'ZodError') {
        return next(
          new ApiError(
            'There are errors in your request. Please correct the highlighted fields.',
            400,
            'VALIDATION_ERROR',
            formatZodErrors(error)
          )
        )
      }
      next(error)
    }
  }

  /**
   * Efetua o logout do usuário, invalidando o refresh token.
   *
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware de tratamento.
   * @returns {Promise<void>}
   */
  async logout(req, res, next) {
    try {
      const user = req.user || req.body.user
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        return next(new ApiError('No token provided', 400, 'NO_TOKEN'))
      }

      let decoded
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      } catch (err) {
        logger.error(err)
        return next(new ApiError('Invalid refresh token', 401, 'INVALID_TOKEN'))
      }

      if (!user || decoded.id !== user.id) {
        return next(
          new ApiError(
            'Unauthorized logout attempt',
            403,
            'UNAUTHORIZED_LOGOUT'
          )
        )
      }

      await AuthService.logout(user.id, refreshToken)

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      })

      return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      return next(new ApiError(error.message, 500, 'INTERNAL_SERVER_ERROR'))
    }
  }

  /**
   * Atualiza o access token utilizando o refresh token presente nos cookies.
   *
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware.
   * @returns {Promise<void>}
   */
  async refreshToken(req, res, next) {
    try {
      const oldRefreshToken = req.cookies.refreshToken
      const { newAccessToken, user } = await AuthService.refreshToken(
        oldRefreshToken
      )
      res.json({ success: true, accessToken: newAccessToken, user })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()
