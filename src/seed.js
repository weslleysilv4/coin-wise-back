const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  const mockUsers = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const user of mockUsers) {
    await prisma.user.create({
      data: user,
    })
  }

  console.log('Seed data inserted successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
