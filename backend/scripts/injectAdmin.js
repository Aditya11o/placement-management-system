const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');

const injectAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    const email = 'jasmin.jamadar23@tnu.in';
    const password = 'Password@123';
    const name = 'Jasmin Jamadar';

    // 1. Handle User
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists. Updating role and password...');
      user.role = 'admin';
      user.password = password; // Hashing handled by model pre-save hook
      user.isVerified = true;
      user.status = 'active';
      await user.save();
    } else {
      console.log('Creating new admin user...');
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        isVerified: true,
        status: 'active'
      });
    }

    // 2. Handle AdminProfile
    let adminProfile = await AdminProfile.findOne({ user: user._id });
    if (adminProfile) {
      console.log('AdminProfile already exists. Updating...');
      adminProfile.full_name = name;
      adminProfile.email = email;
      adminProfile.password = password; // Follow the required field in schema
      await adminProfile.save();
    } else {
      console.log('Creating new AdminProfile...');
      await AdminProfile.create({
        user: user._id,
        admin_id: 'ADM_' + Date.now().toString().slice(-6),
        full_name: name,
        email: email,
        phone: '0000000000',
        password: password, // Follow the required field in schema
        role: 'Super Admin'
      });
    }

    console.log('Admin user injected successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit();
  } catch (error) {
    console.error('Error injecting admin:', error);
    process.exit(1);
  }
};

injectAdmin();
