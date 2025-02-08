class CustomError extends Error {
  constructor(code, message, errors = {}, status = 400) {
    super(message)
    this.name = 'API_ERROR'
    this.code = code
    this.errors = errors
    this.status = status
  }
}

module.exports = CustomError
