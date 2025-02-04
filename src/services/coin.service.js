const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const coinService = {
  async create(data) {
    return prisma.coin.create({ data })
  },

  async findAll({ skip, take }) {
    const [coins, total] = await Promise.all([
      prisma.coin.findMany({
        skip,
        take,
        orderBy: { market_cap_rank: 'asc' },
      }),
      prisma.coin.count(),
    ])

    return {
      coins,
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

  async update(id, data) {
    return prisma.coin.update({
      where: { id },
      data,
    })
  },

  async delete(id) {
    return prisma.coin.delete({
      where: { id },
    })
  },
}

module.exports = coinService
