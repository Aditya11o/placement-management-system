const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = 'mongodb://127.0.0.1:27017/placement_management';

const createAdminRaw = async () => {
    try {
        await mongoose.connect(URI);
        console.log('✅ Connected to MongoDB directly at ' + URI);

        const db = mongoose.connection.db;
        const adminsCollection = db.collection('admins'); // Admin model uses 'admins' collection

        const existingAdmin = await adminsCollection.findOne({ email: 'admin@nexus.edu' });
        if (existingAdmin) {
            console.log('⚠️ Admin account already exists (admin@nexus.edu).');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminDoc = {
            name: 'System Administrator',
            email: 'admin@nexus.edu',
            password: hashedPassword,
            role: 'ADMIN',
            sub_role: 'SUPER_ADMIN',
            isActive: true,
            permissions: ['manage_students', 'manage_recruiters', 'manage_jobs', 'manage_applications', 'manage_announcements', 'view_analytics', 'view_logs', 'manage_api_keys', 'export_data', 'manage_admins'],
            created_at: new Date()
        };

        await usersCollection.insertOne(adminDoc);
        console.log('✅ Default Admin Account Created Successfully via direct insertion!');
        console.log('Login Details:');
        console.log('Role   : Admin');
        console.log('Email  : admin@nexus.edu');
        console.log('Pass   : admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdminRaw();
