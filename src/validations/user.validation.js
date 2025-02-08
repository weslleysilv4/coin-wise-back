const z = require('zod')

const userValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: 'Password must be 5 or more characters long' })
    .max(255),
})

module.exports = userValidation
