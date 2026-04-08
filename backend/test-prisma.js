const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
    try {
        console.log('Testing Prisma connection...');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (error) {
        console.error('Prisma connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();
