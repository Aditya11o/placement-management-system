const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

const prisma = new PrismaClient();
dotenv.config({ path: path.join(__dirname, '../.env') });

const createRecruiter = async () => {
  try {
    const email = 'recruiter_new@pms.com';
    const password = 'Password@123';
    const name = 'New Recruiter';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Handle User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: 'recruiter',
        isVerified: true,
        status: 'active'
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role: 'recruiter',
        isVerified: true,
        status: 'active'
      }
    });

    // 2. Handle RecruiterProfile
    await prisma.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {
        companyName: 'Aditya Tech Solutions',
        companyWebsite: 'https://adityatech.example.com',
        companyLogo: 'https://via.placeholder.com/150',
        position: 'HR Manager',
        location: 'Kolkata, India',
        phone: '9876543210'
      },
      create: {
        userId: user.id,
        companyName: 'Aditya Tech Solutions',
        companyWebsite: 'https://adityatech.example.com',
        companyLogo: 'https://via.placeholder.com/150',
        position: 'HR Manager',
        location: 'Kolkata, India',
        phone: '9876543210'
      }
    });

    console.log('Recruiter account created successfully via Prisma!');
    console.log('------------------------------');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log('------------------------------');

    await prisma.$disconnect();
    process.exit();
  } catch (error) {
    console.error('Error creating recruiter:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

createRecruiter();
