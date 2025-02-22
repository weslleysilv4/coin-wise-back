/* eslint-disable no-unused-vars */
/**
 * Middleware para tratamento centralizado de erros.
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Internal server error!',
    errors: err.errors || {},
  })
}

module.exports = errorHandler
