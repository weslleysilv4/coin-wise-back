const coinService = require('../services/coin.service')
const coinSchema = require('../validations/coin.validation')
const logger = require('../utils/logger')

const coinController = {
  async create(req, res) {
    try {
      const validatedData = coinSchema.parse(req.body)
      const coin = await coinService.create(validatedData)
      logger.info(`Coin created: ${coin.name}`)
      return res.status(201).json(coin)
    } catch (error) {
      if (error?.name === 'ZodError') {
        logger.warn(`Validation error: ${error.issues[0].message}`)
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message:
            'There are errors in your request. Please correct the highlighted fields.',
          errors: Object.fromEntries(
            Object.entries(error.format())
              .filter(([key]) => key !== '_errors')
              .map(([key, value]) => [
                key,
                Array.isArray(value?._errors) && value._errors.length > 0
                  ? value._errors[0]
                  : null,
              ])
          ),
        })
      }
      logger.error(`Error creating coin: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  async findAll(req, res) {
    try {
      const {
        q = '',
        order_by = 'name',
        order = 'asc',
        per_page = 10,
        page = 1,
      } = req.query

      if (!['asc', 'desc'].includes(order.toLowerCase())) {
        return res.status(400).json({ message: 'Order must be ASC or DESC' })
      }

      const skip = (page - 1) * per_page

      const coins = await coinService.findAll({
        query: q,
        orderBy: order_by,
        order: order.toLowerCase(),
        skip: Number(skip),
        take: Number(per_page),
      })

      return res.status(200).json(coins)
    } catch (error) {
      logger.error(`Error fetching coins: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  async findById(req, res) {
    try {
      const coin = await coinService.findById(req.params.id)
      if (!coin) {
        logger.warn(`Coin not found: ${req.params.id}`)
        return res.status(404).json({ message: 'Coin not found' })
      }
      return res.status(200).json(coin)
    } catch (error) {
      logger.error(`Error fetching coin: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  async findByNameOrSymbol(req, res) {
    try {
      const { query } = req.query
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' })
      }

      const coin = await coinService.findByNameOrSymbol(query)

      if (!coin) {
        logger.warn(`Coin not found: ${query}`)
        return res.status(404).json({ message: 'Coin not found' })
      }
      return res.status(200).json(coin)
    } catch (error) {
      logger.error(`Error fetching coin: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  async update(req, res) {
    try {
      const validatedData = coinSchema.partial().parse(req.body)
      const coin = await coinService.update(req.params.id, validatedData)
      logger.info(`Coin updated: ${coin.name}`)
      return res.status(200).json(coin)
    } catch (error) {
      if (error.name === 'ZodError') {
        logger.warn(`Validation error: ${error.issues[0].message}`)
        return res.status(400).json({
          message: 'Validation error',
          errors: error.issues,
        })
      }
      logger.error(`Error updating coin: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },

  async delete(req, res) {
    try {
      await coinService.delete(req.params.id)
      logger.info(`Coin deleted: ${req.params.id}`)
      return res.status(204).send()
    } catch (error) {
      logger.error(`Error deleting coin: ${error.message}`)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },
}

module.exports = coinController
