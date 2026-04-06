const prisma = require('../utils/prisma');

const connectDB = async () => {
  try {
    // Prisma connects lazily, but we can verify connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log(`PostgreSQL Connected (via Prisma)`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
