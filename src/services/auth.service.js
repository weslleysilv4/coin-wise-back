/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const userValidation = require('../validations/user.validation')
const redisClient = require('../config/redis')
const ApiError = require('../utils/ApiError')
const userClient = new PrismaClient().user

class AuthService {
  /**
   * Realiza o login do usuário, validando as credenciais e gerando tokens.
   *
   * @param {string} email - O e-mail do usuário.
   * @param {string} password - A senha do usuário.
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
   * @throws {ApiError} Se os dados de entrada forem inválidos ou se as credenciais estiverem incorretas.
   */
  async login(email, password) {
    await userValidation.parseAsync({ email, password })
    const user = await userClient.findUnique({
      where: { email },
    })

    if (!user) {
      throw new ApiError(
        "We couldn't find a user with this e-mail address!",
        401,
        'INVALID_CREDENTIALS',
        {
          email: 'The email address provided could not be found.',
          password: null,
        }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new ApiError(
        'Incorrect password, try again!',
        401,
        'INVALID_CREDENTIALS',
        {
          email: null,
          password: 'Incorrect password',
        }
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
      data: { refreshToken },
    })

    return { accessToken, refreshToken, user }
  }

  /**
   * Desloga o usuário, removendo o refresh token armazenado e adicionando-o à blacklist no Redis.
   *
   * @param {string} userId - O ID do usuário que será deslogado.
   * @param {string} refreshToken - O refresh token a ser invalidado.
   * @returns {Promise<Object>} Usuário atualizado.
   * @throws {ApiError} Lança erro se o usuário não for encontrado ou se ocorrer outro problema.
   */
  async logout(userId, refreshToken) {
    try {
      const user = await userClient.update({
        where: { id: userId },
        data: { refreshToken: null },
      })

      await redisClient.setex(
        `blacklist:${refreshToken}`,
        7 * 24 * 60 * 60,
        'revoked'
      )

      return user
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(
          "We couldn't find this user id!",
          404,
          'USER_NOT_FOUND',
          { user_id: "The userId provided doesn't exist" }
        )
      }
      throw new ApiError(error.message, 500, 'INTERNAL_SERVER_ERROR')
    }
  }

  /**
   * Atualiza o access token a partir do refresh token fornecido.
   *
   * @param {string} oldRefreshToken - Refresh token enviado pelo cliente.
   * @returns {Promise<{ newAccessToken: string, user: object }>}
   * @throws {ApiError} Lança erro se o token não for fornecido, for inválido ou não corresponder ao usuário.
   */
  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new ApiError(
        'No refresh token provided!',
        401,
        'NO_REFRESH_TOKEN_PROVIDED',
        { refreshToken: 'Please provide a refresh token!' }
      )
    }

    let decoded

    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      throw new ApiError(
        'Invalid token provided',
        401,
        'INVALID_TOKEN_PROVIDED',
        { refreshToken: 'Please provide a valid refresh token!' }
      )
    }

    const user = await userClient.findUnique({ where: { id: decoded.id } })

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new ApiError(
        'Invalid token provided',
        401,
        'INVALID_TOKEN_PROVIDED',
        { refreshToken: 'Please provide a valid refresh token!' }
      )
    }

    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    })

    return { newAccessToken, user }
  }
}

module.exports = new AuthService()
