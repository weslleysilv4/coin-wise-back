const { PrismaClient } = require('@prisma/client')
const calculatePriceChanges = require('../utils/calculatePriceChanges')
const prisma = new PrismaClient()

const coinService = {
  async create(data) {
    const changes = calculatePriceChanges(data)
    return prisma.coin.create({
      data: {
        ...data,
        ...changes,
      },
    })
  },

  async findAll({ query, orderBy, order, skip, take }) {
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

    // Update calculated fields for each coin
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
  },

  async findById(id) {
    return prisma.coin.findUnique({
      where: { id },
    })
  },

  async findByNameOrSymbol(query) {
    return prisma.coin.findFirst({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            symbol: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    })
  },
  async update(id, data) {
    const changes = calculatePriceChanges(data)
    return prisma.coin.update({
      where: { id },
      data: {
        ...data,
        ...changes,
      },
    })
  },

  async delete(id) {
    return prisma.coin.delete({
      where: { id },
    })
  },
}

module.exports = coinService
