const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

const prisma = new PrismaClient();
dotenv.config({ path: path.join(__dirname, '../.env') });

const injectAdmin = async () => {
  try {
    const email = 'jasmin.jamadar23@tnu.in';
    const password = 'Password@123';
    const name = 'Jasmin Jamadar';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Handle User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        status: 'active'
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        status: 'active'
      }
    });

    // 2. Handle AdminProfile
    await prisma.adminProfile.upsert({
      where: { userId: user.id },
      update: {
        employeeId: 'ADM_SYSTEM',
        department: 'Management'
      },
      create: {
        userId: user.id,
        employeeId: 'ADM_SYSTEM',
        department: 'Management'
      }
    });

    console.log('Admin user injected successfully via Prisma!');
    console.log('Email:', email);
    console.log('Password:', password);
    await prisma.$disconnect();
    process.exit();
  } catch (error) {
    console.error('Error injecting admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

injectAdmin();
