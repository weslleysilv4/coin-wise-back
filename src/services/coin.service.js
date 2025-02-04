const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const coinService = {
  async create(data) {
    return prisma.coin.create({ data })
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
