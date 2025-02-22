const sanitizeHtml = require('sanitize-html')

/**
 * Sanitiza um objeto recursivamente:
 * - Se for string, remove todas as tags HTML.
 * - Se for array ou objeto, aplica a sanitização a cada item.
 *
 * @param {any} value - Valor a ser sanitizado.
 * @returns {any} Valor sanitizado.
 */
function sanitizeObject(value) {
  if (typeof value === 'string') {
    return sanitizeHtml(value, {
      allowedTags: [], // Remove todas as tags
      allowedAttributes: {}
    })
  } else if (Array.isArray(value)) {
    return value.map(sanitizeObject)
  } else if (value !== null && typeof value === 'object') {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        value[key] = sanitizeObject(value[key])
      }
    }
    return value
  }
  return value
}

/**
 * Middleware que sanitiza os dados de entrada:
 * - req.body, req.query e req.params.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function sanitizeRequest(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body)
  if (req.query) req.query = sanitizeObject(req.query)
  if (req.params) req.params = sanitizeObject(req.params)
  next()
}

module.exports = sanitizeRequest
