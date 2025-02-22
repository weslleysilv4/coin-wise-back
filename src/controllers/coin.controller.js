const coinService = require('../services/coin.service')
const coinSchema = require('../validations/coin.validation')
const logger = require('../utils/logger')
const ApiError = require('../utils/ApiError')
const formatZodErrors = require('../utils/formatZodErrors')

class CoinController {
  /**
   * Cria uma nova moeda.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async create(req, res, next) {
    try {
      const validatedData = coinSchema.parse(req.body)
      const coin = await coinService.create(validatedData)
      logger.info(`Coin created: ${coin.name}`)
      res.status(201).json({ success: true, message: 'Coin created!', coin })
    } catch (error) {
      if (error?.name === 'ZodError') {
        return next(
          new ApiError(
            'Validation error',
            400,
            'VALIDATION_ERROR',
            formatZodErrors(error)
          )
        )
      }
      next(error)
    }
  }

  /**
   * Retorna uma lista paginada de moedas.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async findAll(req, res, next) {
    try {
      const {
        q = '',
        order_by = 'name',
        order = 'asc',
        per_page = 10,
        page = 1,
      } = req.query

      if (!['asc', 'desc'].includes(order.toLowerCase())) {
        return next(
          new ApiError('Order must be ASC or DESC', 400, 'INVALID_ORDER')
        )
      }

      const skip = (page - 1) * per_page
      const coinsData = await coinService.findAll({
        query: q,
        orderBy: order_by,
        order: order.toLowerCase(),
        skip: Number(skip),
        take: Number(per_page),
      })

      res.status(200).json(coinsData)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Busca uma moeda pelo seu ID.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async findById(req, res, next) {
    try {
      const coin = await coinService.findById(req.params.id)
      if (!coin) {
        return next(new ApiError('Coin not found', 404, 'COIN_NOT_FOUND'))
      }
      res.status(200).json(coin)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Atualiza uma moeda com os dados informados.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async update(req, res, next) {
    try {
      const validatedData = coinSchema.partial().parse(req.body)
      const coin = await coinService.update(req.params.id, validatedData)
      logger.info(`Coin updated: ${coin.name}`)
      res.status(200).json(coin)
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(
          new ApiError(
            'Validation error',
            400,
            'VALIDATION_ERROR',
            formatZodErrors(error)
          )
        )
      }
      next(error)
    }
  }

  /**
   * Exclui uma moeda pelo seu ID.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async delete(req, res, next) {
    try {
      await coinService.delete(req.params.id)
      logger.info(`Coin deleted: ${req.params.id}`)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CoinController()
