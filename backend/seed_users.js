const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@pms.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Student User',
        email: 'student@pms.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true
      },
      {
        name: 'Recruiter User',
        email: 'recruiter@pms.com',
        password: 'Recruiter@123',
        role: 'recruiter',
        isVerified: true
      }
    ];

    for (const userData of users) {
      const userExists = await User.findOne({ email: userData.email });
      if (userExists) {
        console.log(`User ${userData.email} already exists. Updating...`);
        userExists.name = userData.name;
        userExists.password = userData.password;
        userExists.role = userData.role;
        userExists.isVerified = userData.isVerified;
        await userExists.save();
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
