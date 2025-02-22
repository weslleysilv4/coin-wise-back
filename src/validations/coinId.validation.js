const { z } = require('zod')

const coinIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid coin id. Must be a 24-character hexadecimal string.',
    }),
})

module.exports = coinIdSchema
