const { PrismaClient } = require('@prisma/client')
const ApiError = require('../utils/ApiError')
const calculatePriceChanges = require('../utils/calculatePriceChanges')
const prisma = new PrismaClient()

class coinService {
  /**
   * Cria uma nova moeda e calcula os campos derivados.
   *
   * @param {object} data - Dados da moeda.
   * @returns {Promise<object>} Moeda criada.
   * @throws {ApiError} Em caso de erro na criação.
   */
  async create(data) {
    try {
      const changes = calculatePriceChanges(data)
      return await prisma.coin.create({
        data: {
          ...data,
          ...changes,
        },
      })
    } catch (error) {
      throw new ApiError(error.message, 500, 'COIN_CREATE_ERROR')
    }
  }

  /**
   * Retorna uma lista paginada de moedas com contagem total.
   *
   * @param {object} params - Parâmetros de busca e paginação.
   * @returns {Promise<{coins: object[], pagination: object}>}
   * @throws {ApiError} Em caso de erro na consulta.
   */
  async findAll({ query, orderBy, order, skip, take }) {
    try {
      const [coins, total] = await Promise.all([
        prisma.coin.findMany({
          where: query
            ? {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { symbol: { contains: query, mode: 'insensitive' } },
                ],
              }
            : undefined,
          skip,
          take,
          orderBy: {
            [orderBy]: order,
          },
        }),
        prisma.coin.count(
          query
            ? {
                where: {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { symbol: { contains: query, mode: 'insensitive' } },
                  ],
                },
              }
            : undefined
        ),
      ])

      // Atualiza os campos calculados para cada moeda
      const updatedCoins = coins.map((coin) => ({
        ...coin,
        ...calculatePriceChanges(coin),
      }))

      return {
        coins: updatedCoins,
        pagination: {
          total,
          pages: Math.ceil(total / take),
          current: Math.floor(skip / take) + 1,
        },
      }
    } catch (error) {
      throw new ApiError(error.message, 500, 'COIN_FINDALL_ERROR')
    }
  }

  /**
   * Busca uma moeda pelo ID.
   *
   * @param {string} id - ID da moeda.
   * @returns {Promise<object>} Moeda encontrada.
   * @throws {ApiError} Em caso de erro na busca.
   */
  async findById(id) {
    try {
      return await prisma.coin.findUnique({ where: { id } })
    } catch (error) {
      throw new ApiError(error.message, 500, 'COIN_FINDBYID_ERROR')
    }
  }

  /**
   * Atualiza uma moeda com os dados informados e recalcula os campos derivados.
   *
   * @param {string} id - ID da moeda.
   * @param {object} data - Dados para atualização.
   * @returns {Promise<object>} Moeda atualizada.
   * @throws {ApiError} Em caso de erro na atualização.
   */
  async update(id, data) {
    try {
      const changes = calculatePriceChanges(data)
      return await prisma.coin.update({
        where: { id },
        data: {
          ...data,
          ...changes,
        },
      })
    } catch (error) {
      throw new ApiError(error.message, 500, 'COIN_UPDATE_ERROR')
    }
  }

  /**
   * Exclui uma moeda pelo ID.
   *
   * @param {string} id - ID da moeda.
   * @returns {Promise<object>} Moeda excluída.
   * @throws {ApiError} Em caso de erro na exclusão.
   */
  async delete(id) {
    try {
      return await prisma.coin.delete({ where: { id } })
    } catch (error) {
      throw new ApiError(error.message, 500, 'COIN_DELETE_ERROR')
    }
  }
}

module.exports = new coinService()
