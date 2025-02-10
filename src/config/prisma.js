const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Connection management
prisma
  .$connect()
  .then(() => console.log('📦 Database connected'))
  .catch((error) => console.error('Database connection failed:', error))

// Handle disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

module.exports = prisma
