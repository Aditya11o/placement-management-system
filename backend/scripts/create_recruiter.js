const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');

dotenv.config();

const createRecruiter = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    // Use a unique email
    const email = 'recruiter_new@pms.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Recruiter already exists. Deleting to recreate...');
      await CompanyProfile.deleteMany({ recruiter_id: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 1. Create User
    const user = await User.create({
      name: 'New Recruiter',
      email: email,
      password: 'Password@123',
      role: 'recruiter',
      status: 'active',
      isVerified: true
    });
    console.log(`Created user: ${user.email}`);

    // 2. Create Company Profile
    await CompanyProfile.create({
      company_id: 'COMP' + Date.now().toString().slice(-6),
      recruiter_id: user._id,
      company_name: 'Aditya Tech Solutions',
      company_logo: 'https://via.placeholder.com/150',
      website: 'https://adityatech.example.com',
      description: 'A growing technology company providing innovative solutions.',
      industry: 'Technology',
      company_size: '100-500',
      location: 'Kolkata, India',
      hr_name: 'Aditya Recruiter',
      hr_email: 'hr@adityatech.example.com',
      hr_phone: '9876543210'
    });
    console.log('Created Company Profile: Aditya Tech Solutions');

    console.log('Recruiter account created successfully!');
    console.log('------------------------------');
    console.log(`Email: ${user.email}`);
    console.log(`Password: Password@123`);
    console.log('------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error creating recruiter:', error);
    process.exit(1);
  }
};

createRecruiter();
