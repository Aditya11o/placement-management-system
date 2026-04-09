const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  console.log('Seeding default users...');

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@pms.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@pms.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      adminProfile: { create: {} }
    }
  });

  // 2. Student
  const student = await prisma.user.upsert({
    where: { email: 'student@pms.com' },
    update: {},
    create: {
      name: 'Default Student',
      email: 'student@pms.com',
      password: hashedPassword,
      role: 'student',
      status: 'active',
      studentProfile: { 
        create: { 
          cgpa: 8.5, 
          branch: 'Computer Science', 
          academicVerified: true,
          resumePath: 'https://res.cloudinary.com/dummy.pdf'
        } 
      }
    }
  });

  // 3. Recruiter
  await prisma.user.upsert({
    where: { email: 'recruiter@pms.com' },
    update: {},
    create: {
      name: 'HR Manager',
      email: 'recruiter@pms.com',
      password: hashedPassword,
      role: 'recruiter',
      status: 'active', // Set to active for easy testing
      recruiterProfile: { create: { companyName: 'Google' } }
    }
  });

  // 4. Custom User
  await prisma.user.upsert({
    where: { email: 'halderaditya634@gmail.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'halderaditya634@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      adminProfile: { create: {} }
    }
  });

  console.log('Seed completed successfully!');
  console.log('Logins: admin@pms.com / password123, student@pms.com / password123, recruiter@pms.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
