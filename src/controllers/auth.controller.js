const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const AuthService = require('../services/auth.service')

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body
      const { accessToken, refreshToken, user } = await AuthService.login(
        email,
        password
      )

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return res.json({
        success: true,
        message: 'Sucessfully logged in!',
        accessToken,
        user,
      })
    } catch (error) {
      if (error?.name === 'ZodError') {
        return res.status(401).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message:
            'There are errors in your request. Please correct the highlighted fields.',
          errors: {
            email:
              error.issues.find((item) => item.path[0] === 'email')?.message ||
              null,
            password:
              error.issues.find((item) => item.path[0] === 'password')
                ?.message || null,
          },
        })
      }
      return res.status(401).json({
        success: false,
        code: error.code,
        message: error.message,
        errors: error.errors,
      })
    }
  },

  async logout(req, res) {
    try {
      const user = req.body.user
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return res.status(400).json({ message: 'No token provided' })
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      if (decoded.id !== user.id) {
        return res.status(403).json({ message: 'Unauthorized logout attempt' })
      }

      await AuthService.logout(user.id, refreshToken)

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      })
      return res.status(200).json({ message: 'Logged out sucessfully' })
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  },

  authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) {
      logger.error('No token provided')
      return res.status(401).json({ error: 'Access Denied' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.error(`Invalid token: ${err.message}`)
        return res
          .status(401)
          .json({ message: `Unauthorized! error: ${err.message}` })
      }

      logger.info(`User ${user.id} authenticated successfully`)
      req.user = user
      next()
    })
  },

  async refreshToken(req, res) {
    try {
      const oldRefreshToken = req.cookies.refreshToken
      const { newAccessToken, user } = await AuthService.refreshToken(
        oldRefreshToken
      )
      return res.json({ success: true, accessToken: newAccessToken, user })
    } catch (error) {
      return res.status(401).json({ sucess: false, message: error.message })
    }
  },
}

module.exports = authController
