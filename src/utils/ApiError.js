/**
 * Classe para erros customizados na API.
 * @example {
 *     message: 'Internal server error!',
 *     statusCode: 500,
 *     code: 'INTERNAL_SERVER_ERROR'
 *     errors: { },
 * }
 */
class ApiError extends Error {
  constructor(message, statusCode, code, errors = null) {
    super(message)
    this.name = 'API_ERROR'
    this.statusCode = statusCode
    this.code = code
    this.errors = errors
  }
}

module.exports = ApiError
