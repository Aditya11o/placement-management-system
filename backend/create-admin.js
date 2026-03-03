require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

const URI = 'mongodb://127.0.0.1:27017/placement_management';

const createAdmin = async () => {
    try {
        await mongoose.connect(URI);
        console.log('✅ Connected to MongoDB at ' + URI);

        const existingAdmin = await Admin.findOne({ email: 'admin@nexus.edu' });
        if (existingAdmin) {
            console.log('⚠️ Admin account already exists (admin@nexus.edu).');
            process.exit(0);
        }

        const adminUser = new Admin({
            name: 'System Administrator',
            email: 'admin@nexus.edu',
            password: 'admin123',
            role: 'ADMIN',
            sub_role: 'SUPER_ADMIN',
            isActive: true,
            permissions: ['manage_users', 'manage_jobs', 'manage_admins', 'view_analytics', 'manage_content']
        });

        await adminUser.save();
        console.log('✅ Default Admin Account Created Successfully!');
        console.log('Login Details:');
        console.log('Role   : ADMIN');
        console.log('Email  : admin@nexus.edu');
        console.log('Pass   : admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
