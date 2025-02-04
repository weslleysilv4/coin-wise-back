const { z } = require('zod')

const userValidation = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(255),
})

module.exports = { userValidation }
