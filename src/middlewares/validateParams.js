/* eslint-disable no-unused-vars */
const { z } = require('zod')
const ApiError = require('../utils/ApiError')
const formatZodErrors = require('../utils/formatZodErrors')

/**
 * Gera um middleware para validar os parâmetros da rota utilizando um schema do Zod.
 *
 * @param {z.ZodSchema} schema - Schema do Zod para validar req.params.
 * @returns {import('express').RequestHandler} Middleware de validação.
 */
function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params)
      next()
    } catch (error) {
      next(
        new ApiError(
          'Invalid parameters',
          400,
          'INVALID_PARAMS',
          formatZodErrors(error)
        )
      )
    }
  }
}

module.exports = validateParams
