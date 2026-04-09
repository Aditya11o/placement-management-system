require('dotenv').config();
const prisma = require('../utils/prisma');

/**
 * Clears all data from the database between tests.
 * This is safer than dropping the database and faster than re-running migrations.
 */
const clear = async () => {
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const connect = async () => {
  await prisma.$connect();
};

const close = async () => {
  await prisma.$disconnect();
};

module.exports = { connect, close, clear };
