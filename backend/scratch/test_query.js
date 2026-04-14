const prisma = require('../utils/prisma');

async function test() {
  try {
    console.log('Testing groupBy query...');
    const companies = await prisma.job.groupBy({
      by: ['companyName'],
      _count: {
        id: true
      },
      orderBy: {
        companyName: 'asc'
      }
    });
    console.log('Result:', companies);
    process.exit(0);
  } catch (error) {
    console.error('Query Failed:', error);
    process.exit(1);
  }
}

test();
