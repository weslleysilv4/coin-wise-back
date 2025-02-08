const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const userValidation = require('../validations/user.validation')
const CustomError = require('../utils/CustomError')

const userClient = new PrismaClient().user

class AuthService {
  async login(email, password) {
    await userValidation.parseAsync({ email, password })

    const user = await userClient.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new CustomError(
        'INVALID_CREDENTIALS',
        "We couldn't find a user with this e-mail address!",
        {
          email: 'The email address provided could not be found.',
          password: null,
        },
        401
      )
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new CustomError(
        'INVALID_CREDENTIALS',
        'Incorrect password, try again!',
        { email: null, password: 'Incorect password' },
        401
      )
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    })
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      }
    )

    await userClient.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    })

    return { accessToken, refreshToken, user }
  }

  async logout(userId) {
    await userClient.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) throw new Error('No refresh token provided!')
    let decoded

    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (err) {
      throw new Error('Invalid token provided: ', err)
    }

    const user = await userClient.findUnique({ where: { id: decoded.id } })

    if (!user || user.refreshToken !== oldRefreshToken)
      throw new Error('Invalid refresh token!')

    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    })

    return newAccessToken
  }
}

module.exports = new AuthService()
