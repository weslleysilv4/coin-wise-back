const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const logger = require('../logger')
const { userValidation } = require('../validations/user.validation')

const userClient = new PrismaClient().user

const authController = {
  async login(req, res) {
    try {
      await userValidation.parse(req.body)
      const { email, password } = req.body

      const user = await userClient.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return res.status(400).json({ message: 'User not found' })
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid Credentials' })
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      })

      res.status(200).json({ token: token })
    } catch (error) {
      // Handle Zod validation errors
      if (error?.name === 'ZodError') {
        const message = error.issues[0]?.message || 'Validation error'
        return res.status(400).json({ message })
      }

      res.status(400).json({ message: error || 'An error occurred' })
    }
  },
  authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) {
      logger.error('No token provided')
      return res.status(401).json({ error: 'Access Denied' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.error(`Invalid token: ${err.message}`)
        return res.status(401).json({ message: 'Unauthorized!' })
      }

      logger.info(`User ${user.id} authenticated successfully`)
      req.user = user
      next()
    })
  },
}

module.exports = authController
