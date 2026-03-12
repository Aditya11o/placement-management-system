const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('creation_status.txt', msg + '\n');
};

const createSuperAdmin = async () => {
    try {
        if (fs.existsSync('creation_status.txt')) fs.unlinkSync('creation_status.txt');

        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_management';
        log('Attempting to connect to: ' + uri);
        await mongoose.connect(uri);
        log('Connected to MongoDB successfully');

        const email = 'superadmin@tnu.com';
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            log(`Admin with email ${email} already exists`);
            log(`Name: ${existingAdmin.name}`);
            log(`Sub-role: ${existingAdmin.sub_role}`);
            process.exit(0);
        }

        log('Creating new Super Admin...');
        const newAdmin = new Admin({
            name: 'Super Admin',
            email: email,
            password: 'SuperSecurePassword123!',
            sub_role: 'SUPER_ADMIN',
            permissions: [
                'manage_students',
                'manage_recruiters',
                'manage_jobs',
                'manage_applications',
                'manage_announcements',
                'view_analytics',
                'view_logs',
                'manage_api_keys',
                'export_data',
                'manage_admins'
            ]
        });

        await newAdmin.save();
        log('Super Admin created successfully for: ' + email);
        process.exit(0);
    } catch (err) {
        log('CRITICAL ERROR: ' + err.stack);
        process.exit(1);
    }
};

createSuperAdmin();
