const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const companies = await prisma.job.groupBy({
      by: ['companyName'],
      _count: {
        id: true
      },
      orderBy: {
        companyName: 'asc'
      }
    });
    console.log('Grouped companies:', JSON.stringify(companies, null, 2));

    const enriched = await Promise.all(companies.map(async (c) => {
      const recruiter = await prisma.recruiterProfile.findFirst({
        where: { companyName: { equals: c.companyName, mode: 'insensitive' } },
        select: { companyLogo: true }
      });

      return {
        name: c.companyName,
        jobCount: c._count.id,
        logo: recruiter?.companyLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.companyName}`
      };
    }));
    console.log('Enriched companies:', JSON.stringify(enriched, null, 2));
  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
