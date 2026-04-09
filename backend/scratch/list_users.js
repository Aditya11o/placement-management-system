const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, status: true }
  });
  console.log('USERS IN DB:');
  console.table(users);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
