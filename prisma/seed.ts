import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Optional: Add seed data here for testing
  console.log('No seed data configured. Add test data in prisma/seed.ts if needed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

