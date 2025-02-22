const z = require('zod')

const userValidation = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'Password must be 6 or more characters long' })
    .max(255, {
      message: 'Password must be less than or equal to 255 characters',
    }),
})

module.exports = userValidation
